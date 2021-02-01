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
    readFile,
    requestGet,
  } = require('../utils'),
  _ = require('lodash'),
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
  tokenLifeShort = 15 * minute,
  tokenLifeLong = 3 * day,
  rt_cookie = 'jid',
  createAccessToken = (session, ttl = tokenLifeShort) => {
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
  setSession = (session, ttl) =>
    cache.set(session.username, session, {
      ns: 'session',
      ttl,
    }),
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

//TBD: this should be coming from database
const companies = [{ name: 'Philosophers League', id: 'philo' }];

module.exports = function routes(app, models, resourcePath) {
  app.get('/echo', (req, res) => {
    res.status(200).send('echo');
  });

  //Create session, return access_token, set refresh_token
  app.get('/login', async (req, res) => {
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
      [refresh_token, access_token] = await Promise.all([
        createToken({}, REFRESH_TOKEN_SECRET, {
          expiresIn: tokenLifeLong.toString(),
          issuer: APP_NAME,
          subject: session.username,
        }),
        createAccessToken(session),
        insertRecord(models, session, 'signin'),
        setSession(session, tokenLifeLong),
      ]);
    res.cookie(rt_cookie, refresh_token, {
      maxAge: tokenLifeLong,
      path: '/auth',
      httpOnly: true,
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
    const { userId } = req.query, //companyId,
      [{ error, status, session, ttl }, usr] = await Promise.all([
        authenticate(req),
        models.users.findOne({
          username: userId,
        }),
      ]);
    if (error) return res.status(status).send({ error });
    if (!usr) return res.status(417).send({ error: 'No user found' });

    session.user = {
      id: usr.username,
      name: `${usr.firstName} ${usr.lastName}`,
      roles: usr.roles,
      uom: 'M',
      locale: 'en-CA',
    };
    session.company = companies[0];

    const [access_token] = await Promise.all([
      createAccessToken(session),
      setSession(session, ttl),
      insertRecord(models, session, 'impersonate'),
    ]);

    res.send({
      session,
      access_token,
      ttl: tokenLifeShort,
    });
  });

  //retrieve session by http cookie,
  //create and return access_token
  app.get('/auth/handshake', async (req, res) => {
    const { error, session } = await authenticate(req);
    if (error) return res.send({ error });

    const [access_token] = await Promise.all([
      createAccessToken(session),
      insertRecord(models, session, 'handshake'),
    ]);

    return res.send({
      session,
      versions,
      access_token,
      ttl: tokenLifeShort,
    });
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

  app.get('/lookups', async (req, res) => {
    // const { error, status } = await guarded(req);
    const keys = req.query.ids.split(',');
    const lookups = await models.lookups.find({
      id: { $in: keys },
    });

    return res.send(lookups);
  });

  //TBD
  app.get('/schema', async (req, res) => {
    const keys = Object.keys(req.query).filter((k) => !!req.query[k]),
      files = await Promise.all(
        keys.map((k) => readFile(resourcePath, 'app', `${k}.json`))
      ),
      schema = files.reduce((acc, f, i) => {
        acc[keys[i]] = JSON.parse(f);
        return acc;
      }, {});

    if (res.types) {
      schema.types = _.pick(schema.types, req.query.types.split(','));
    }
    return res.send(schema);
  });

  app.get('/appConfig', async (req, res) => {
    return res.send({});
  });

  app.get('/companyConfig', async (req, res) => {
    const { error, status, company } = await guarded(req);
    if (error) return res.status(status).send({ error });
    if (!company)
      return res.status(403).send({ error: 'Not impersonated' });

    const [usrs, file] = await Promise.all([
        models.users.find({}),
        readFile(resourcePath, 'lookups', `${company}.json`),
      ]),
      parsed = JSON.parse(file),
      lookups = Object.entries(parsed).map(([k, v]) => ({
        id: k,
        name: k,
        value: v,
      })),
      users = usrs.map((e) => ({
        id: e.username,
        name: `${e.firstName} ${e.lastName}`,
        roles: e.roles,
      }));
    //may also pick company-specific Types and app config features
    return res.send({ lookups, users });
  });
};
