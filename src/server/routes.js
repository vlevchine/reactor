const {
    APP_NAME,
    TOKEN_SECRET,
    REFRESH_TOKEN_SECRET,
    V_LOOKUPS,
    V_TYPES,
  } = process.env,
  {
    createToken,
    verifyToken,
    //readFile,
    requestGet,
  } = require('../utils'),
  { cache } = require('./db/cache'),
  versions = { lookups: V_LOOKUPS, types: V_TYPES };
//On login, create refresh_token (set it as http cookie) and session
//- same long life, and access_token with no user - at this point app data may be requested;
//on impersonate issue short lived access_token, with user info;
//during session lifetime, re-issue access_tokens per user in session;
//on app start run handshake - return access_token per existing session as in http cookie
//on logout, revoke http cookie and destroy session
//Error codes used: 400, 401, 417
//session: {username: social.email, socialName, provider, user: {id, name, roles}, company: coid }
//access_token: {sub: social.email,user: user.id, company: coId, roles: user.roles}

const minute = 60 * 1000,
  day = 24 * 60 * minute,
  tokenLifeShort = 60 * minute, //15
  tokenLifeLong = 5 * day, //1
  rt_cookie = 'jid',
  createAccessToken = (session = {}, ttl = tokenLifeShort) => {
    const { user, company, username } = session,
      content =
        user && company
          ? { user: user.id, company: company.id, roles: user.roles }
          : {};
    return createToken(content, TOKEN_SECRET, {
      expiresIn: ttl.toString(),
      issuer: APP_NAME,
      subject: username,
    });
  },
  createRefreshToken = (username) =>
    createToken({}, REFRESH_TOKEN_SECRET, {
      expiresIn: tokenLifeLong.toString(),
      issuer: APP_NAME,
      subject: username,
    }),
  insertRecord = (models, session, type) =>
    models.sessions.insertOne({
      type,
      timestamp: new Date(),
      ...session,
    }),
  parseHeader = (req) => {
    return req.get('Authorization')?.replace('Bearer ', '');
  },
  guarded = async (req) => {
    const token = parseHeader(req),
      payload = await verifyToken(token, TOKEN_SECRET);
    let { iss, error } = payload;
    if (error) return { status: 401, error };
    if (iss !== APP_NAME)
      return { status: 401, error: 'Incorrect issurer' };
    return payload;
  },
  parseCookie = async (req) => {
    const token = req.cookies[rt_cookie];
    if (!token) return { status: 400, error: 'no token' };
    const payload = await verifyToken(token, REFRESH_TOKEN_SECRET);
    if (payload.iss !== APP_NAME)
      return { status: 400, error: 'incorrect token issurer' };
    if (!payload.sub)
      return { status: 400, error: 'no subject in token' };
    return payload;
  },
  getSession = async (username) => {
    return cache.get(username, 'session');
  },
  setSession = async (session, ttl) => {
    cache.set(session.username, session, {
      ns: 'session',
      ttl,
    });
  },
  getTtl = (exp) => exp * 1000 - Date.now(),
  authenticate = async (req, life = tokenLifeShort) => {
    const { status, error, sub = '', exp } = await parseCookie(req);
    if (error) return { status, error };
    const ttl = getTtl(exp);
    if (ttl < life) return { status: 401, error: 'Session expired' };
    const session = await getSession(sub);
    if (!session) return { status: 401, error: 'No active session' };

    return { session, ttl };
  };

module.exports = function routes(app, models) {
  //, resourcePath
  app.get('/echo', (req, res) => {
    res.status(200).send('echo');
  });

  //Create session, return access_token, set refresh_token
  app.get('/auth/login', async (req, res) => {
    const token = parseHeader(req),
      { provider } = req.query,
      scl = await requestGet(
        `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${token}`
      ),
      social = JSON.parse(scl.toString());

    if (!social)
      return res
        .status(400)
        .send({ error: 'social id_token invalid or expired' });

    const session = {
        username: social.email,
        socialName: social.name,
        provider: provider,
      },
      refresh_token = createRefreshToken(session.username),
      access_token = createAccessToken(session);
    await Promise.all([
      insertRecord(models, session, 'signin'),
      setSession(session, tokenLifeLong),
    ]);

    res.cookie(rt_cookie, refresh_token, {
      maxAge: tokenLifeLong,
      path: '/', //'/auth',
      httpOnly: true,
      // sameSite: 'None',
    });

    return res.send({
      session,
      versions,
      access_token,
      ttl: tokenLifeShort,
    });
  });

  //Clear session
  app.get('/auth/logout', async (req, res) => {
    const { status, error, sub } = await parseCookie(req);
    if (error) return res.status(status).send({ error });
    await Promise.all([
      cache.remove(sub, 'session'),
      insertRecord(models, { username: sub }, 'signout'),
    ]);
    res.cookie(rt_cookie, '', {
      path: '/auth',
      maxAge: 0,
      httpOnly: true,
      overwrite: true,
    });
    return res.send({ ok: true });
  });

  //check if session exists, find user, update session,
  //return new access_token
  app.get('/auth/impersonate', async (req, res) => {
    const { companyId, userId } = req.query, //companyId,
      [{ error, status, session, ttl }, usr, co] = await Promise.all([
        authenticate(req),
        models.users.findOne({
          username: userId,
          company: companyId,
        }),
        models.companies.findOne({ id: companyId }),
      ]);
    if (error) return res.status(status).send({ error });
    if (!usr) return res.status(417).send({ error: 'No user found' });

    session.user = {
      id: usr.username,
      name: usr.name,
      roles: usr.roles,
      ...usr.settings,
    };
    session.company = { id: companyId, name: co.name };
    await Promise.all([
      createAccessToken(session),
      setSession(session, ttl),
      insertRecord(models, session, 'impersonate'),
    ]);
    const payload = {
      session,
      access_token: createAccessToken(session),
      ttl: tokenLifeShort,
    };

    res.send(payload);
  });

  //retrieve session by http cookie,
  //create and return access_token
  app.get('/auth/handshake', async (req, res) => {
    //  var session = await getSession('vlevchine22@gmail.com');
    const { error, session } = await authenticate(req);
    if (error) return res.send({ error });

    const payload = {
      session,
      versions,
      access_token: createAccessToken(session),
      ttl: tokenLifeShort,
    };

    return res.send(payload);
  });

  //check existing session by http cookie,
  //if exists, create and return access_token
  //decline if less then 1/4 of expected token life left for refresh_token
  app.get('/auth/refresh', async (req, res) => {
    const life = tokenLifeShort / 4,
      { error, status, session, ttl } = await authenticate(req, life);
    if (error) return res.status(status).send({ error });
    const span = Math.min(ttl, tokenLifeShort),
      access_token = await createAccessToken(session, span);

    return res.send({ access_token, ttl: span });
  });

  const _empty = {};
  //Used for impersonation -
  app.get('/auth/allusers', async (req, res) => {
    const [users, companies] = await Promise.all([
        models.users.find(
          _empty,
          _empty,
          'name username company roles'
        ),
        models.companies.find(_empty, _empty, 'name id'),
      ]),
      co = companies.map((c) => ({
        ...c,
        users: users
          .filter((u) => u.company === c.id)
          .map((u) => ({ ...u, id: u.username })),
      }));

    return res.send(co);
  });


  // app.get('/schema', async (req, res) => {
  //   const keys = ['queries', 'mutations'],
  //     files = await Promise.all(
  //       keys.map((k) => readFile(resourcePath, 'app', `${k}.json`))
  //     ),
  //     schema = files.reduce((acc, f, i) => {
  //       acc[keys[i]] = JSON.parse(f);
  //       return acc;
  //     }, {});

  //   return res.send(schema);
  // });

  // app.get('/companyConfig', async (req, res) => {
  //   const guard = await guarded(req),
  //     { error, status, company } = guard;
  //   if (error) return res.status(status).send({ error });
  //   if (!company)
  //     return res.status(403).send({ error: 'Not impersonated' });

  //   const [co, users, lookups, types] = await Promise.all([
  //     models.companies.findOne({ id: company }, _empty, { _id: 0 }),
  //     models.users.find({ company }, _empty, {
  //       name: 1,
  //       username: 1,
  //       roles: 1,
  //       _id: 0,
  //     }),
  //     models.lookups.find({ company, required: true }, _empty, {
  //       id: 1,
  //       _id: 0,
  //       items: 1,
  //     }),
  //     models.types.find({ company, required: true }, _empty, {
  //       depends: 0,
  //     }),
  //   ]);
  //   users.forEach((e) => {
  //     e.id = e.username;
  //   });
  //   //may also pick company-specific Types and app config features
  //   return res.send({
  //     lookups,
  //     users,
  //     company: co,
  //     types,
  //   });
  // });

  function getOptionsInfo({ page, size, limit, sort } = {}) {
    const options = {};
    if (sort) {
      options.sort = Object.fromEntries(Object.entries(sort)
      .map(([k,v]) => [k, v === 'asc' ? 1 : -1]));
    }
    options.limit = parseInt(size) || parseInt(limit) || 1000;
    if (page) {
      options.skip = ((parseInt(page) || 1) - 1) * options.limit;
    }
    return options;
  }
  function parseFilters(filter) {
    if (!filter) return {};
    const filters = JSON.parse(Buffer.from(filter, 'base64').toString());
    if (filters.search) {
      const [k,v] = Object.entries(filters.search)[0];
      filters[k] = {$regex: `^${v}`, $options: 'i'};
      delete filters.search
    }

   return filters
  }
  const typeMap = {
      Type: 'types',
      Lookup: 'lookups',
      User: 'users',
      Company: 'companies',
      Well: 'wells',
      Person: 'persons'
    },
    operationTypes = {
      get: 'findOne',
      add: 'insertOne',
      delete: 'deleteOne',
      update: 'updateOne',
    },
      searchOne = (id, company, common) => ( {
                id,
                company: common || company === 'host' ? null : company,
              }),
    getOperations = (ops = [], names, company) => {
      return ops.map((e, i) => {
        const {
          op: oper,
          type,
          id,
          common,
          item,
          filter,
          options, //{ skip, limit, sort }
          project,
        } = e;
        let _op = oper || 'get',
          op = operationTypes[_op],
          filters = parseFilters(filter),
          args = [];

        if (_op === 'get') {
          if (id) {
            //if common set, findOne searches common data item - with {id, company: null},
            //otherwise - specific data item with {id, company}
            args = [searchOne(id,company,common), project];
          } else {
//if common not set, findMany searches comany items with {company}, 
//if common=1, only common data with {company: null}
//if common=2, all data {company: $#in:[company, null]}
            const filterBy = {
              company: !common ? company : common === 1 ? null :  { $in: [null, company] } ,
              ...filters,
            };
            op = 'find';
            args = [filterBy, getOptionsInfo(options), project];
          }
        } else if (_op === 'add') {
          if (company !== 'host') item.company = company;
          args = [item];
        } else args = [searchOne(id,company,common), item];

        const action = { op, args, name: typeMap[type] || names[i] };
        return action;
      });
    },
    runOperation = ({ name, op, args }) => models[name][op](...args);
  //Entity endpoint, oper:[], or {} of get, add, delete, update
  //oper : {get: {id}}
  app.post('/entity', async (req, res) => {
    const { error, status, company = null } = await guarded(req);
    if (error) return res.status(status).send({ error });
    const sequence = Array.isArray(req.body),
      opNames = sequence ? [] : Object.keys(req.body),
      operations = getOperations(
        sequence ? req.body : Object.values(req.body),
        opNames,
        company
      );
    let results = [];
    if (sequence) {
      const starterPromise = Promise.resolve(null),
        log = (result) => results.push(result);
      await operations.reduce(
        (p, spec) => p.then(() => runOperation(spec).then(log)),
        starterPromise
      );
    } else {
      const data = await Promise.all(operations.map(runOperation));
      results = data.reduce(
        (acc, e, i) => ({ ...acc, [opNames[i]]: e?.result || e }),
        {}
      );
    }

    return res.send(results);
  });

  // app.get('/entities/:name', async (req, res) => {
  //   const { error, status, company } = await guarded(req),
  //     { filter, own, projection } = req.query,
  //     { name } = req.params,
  //     co =
  //       own === 'true'
  //         ? company
  //         : own === 'false'
  //         ? null
  //         : { $in: [null, company] },
  //     filters = { company: co, ...getFiltersInfo(filter) },
  //     options = getOptionsInfo(req.query),
  //     project = projection
  //       ? projection
  //           .split(' ')
  //           .reduce((acc, e) => ({ ...acc, [e]: 1 }), {})
  //       : undefined;
  //   if (error) return res.status(status).send({ error });
  //   const [entities, count] = await Promise.all([
  //     models[name].find(filters, options, project),
  //     models[name].count(filters),
  //   ]);
  //   //  projection
  //   return res.send({ count, entities });
  // });

  // app.get('/entity/:name', async (req, res) => {
  //   const { error, status } = await guarded(req);
  //   if (error) return res.status(status).send({ error });
  //   const { id } = req.query,
  //     { name } = req.params;

  //   const item = await models[name].findOne({ id: id });
  //   return res.send(item);
  // });
  // //add
  // app.post('/entity/:name', async (req, res) => {
  //   const { error, status } = await guarded(req);
  //   if (error) return res.status(status).send({ error });
  //   const { item } = req.body,
  //     { name } = req.params;
  //   if (!item) {
  //     return res
  //       .status(400)
  //       .send({ error: 'Content can not be empty!' });
  //   }
  //   return res.send({ name });
  //   // const data = models[name].insertOne(item);
  //   // return res.send(data);
  // });
  // //delete,update
  // app.delete('/entity/:name/:id', async (req, res) => {
  //   const { error, status } = await guarded(req);
  //   if (error) return res.status(status).send({ error });
  //   const { name, id } = req.params;
  //   try {
  //     const item = models[name].deleteOne({ _id: id });
  //     return item
  //       ? res.send({ id, message: `Item with id ${id} deleted` })
  //       : res.status(404).send({
  //           message: `Item with id=${id} was not found!`,
  //         });
  //   } catch (err) {
  //     res.status(500).send(error);
  //   }
  // });
  // //update
  // app.patch('/entity/:name/:id', async (req, res) => {
  //   const { error, status } = await guarded(req);
  //   if (error) return res.status(status).send({ error });
  //   const { item } = req.body,
  //     { name, id } = req.params;
  //   if (!item) {
  //     return res
  //       .status(400)
  //       .send({ error: 'Content can not be empty!' });
  //   }
  //   return res.send({ name, id });
  //   // const data = models[name].updateOne(id, item);
  //   // return data ? res.send({ data })
  //   //   : res.status(404).send({
  //   //       message: `Item with id=${id} was not found!`,
  //   //     });
  // });
};
