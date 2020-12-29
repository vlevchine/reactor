const {
    UserInputError,
    ApolloError,
  } = require('apollo-server-express'),
  { GraphQLScalarType } = require('graphql'), //, defaultFieldResolver
  { omit, pick } = require('lodash'),
  GraphQLJSON = require('graphql-type-json'),
  {
    GraphQLDate,
    GraphQLTime,
    GraphQLDateTime,
  } = require('graphql-iso-date'),
  {
    processWellData,
    addCostCenters,
    person,
    guard,
    guardSocial,
    generateToken,
  } = require('../resolverHelpers'),
  { processConfig } = require('../../.playground/compiler'),
  { cache } = require('../db/cache'),
  {
    readFile,
    writeFile,
    requireFromString,
    createToken,
    verifyToken,
  } = require('../../utils');

const { TOKEN_SECRET, APP_NAME, V_LOOKUPS, V_TYPES } = process.env;

const tokenLifeShort = '1h',
  tokenLifeLong = 72 * 60 * 60 * 1000,
  getId = (parent) => parent._id;

const MoneyScalar = new GraphQLScalarType({
  name: 'Money',
  description: 'Money custom scalar type',
  parseValue(value) {
    return new Date(value); // value from the client
  },
  serialize(value) {
    return value.getTime(); // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value); // ast value is always in string format
    }
    return null;
  },
});

const FiltersScalar = new GraphQLScalarType({
  name: 'Filters',
  description: 'Money custom scalar type',
  parseValue(value) {
    return JSON.parse(value); // value from the client
  },
  serialize(value) {
    return JSON.stringify(value); // value sent to the client
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return new Date(ast.value); // ast value is always in string format
    }
    return null;
  },
});

const jsonOmit = ['_id', 'id', 'createdAt', 'updatedAt'];
const baseResolvers = ({ resourcePath, pageTypesLoc }) => ({
  JSON: GraphQLJSON,
  Date: GraphQLDate,
  Time: GraphQLTime,
  DateTime: GraphQLDateTime,
  Money: MoneyScalar,
  Filters: FiltersScalar,
  Node: {
    __resolveType() {
      return null;
    },
  },
  DisplayableError: {
    __resolveType() {
      return null;
    },
  },

  Query: {
    version: async () => {
      return '1.0.0.1';
    },
    handshake: async () => {
      return {
        v_lookups: parseInt(V_LOOKUPS),
        v_types: parseInt(V_TYPES),
      };
    },
    user: async (parent, { id }, { models }) => {
      return models.users.findById(id);
    },
    users: async (parent, args, ctx) => {
      //TBD - returns all users - for now!!!
      const { auth = {}, models } = ctx,
        users = await models.users.find({ company: auth.company });

      return auth ? users : [];
    },
    companies: async (parent, args, ctx) => {
      const { auth = {}, models } = ctx;
      //var rt = auth.roles;
      return models.companies.find();
    },
    async lookups(_, { company }, { auth }) {
      guard(auth);
      const fileNames = company
          ? [`${company}.json`]
          : ['well_lookups.json', '_common.json'],
        files = await Promise.all(
          fileNames.map((e) => readFile(resourcePath, 'lookups', e))
        );

      let [specific, common] = files.map(JSON.parse);
      if (common) {
        common = processWellData(specific, common);
        addCostCenters(common);

        return common;
      } else return specific;
    },
    pageConfig: async (_, args, ctx) => {
      //  guard(ctx); //, (roles) => true
      const res = { types: {} };
      try {
        var { key } = args,
          ctn = await readFile(pageTypesLoc, `${key}.types.json`);
        res.types = JSON.parse(ctn);
      } catch (err) {
        res.message = 'No/incorrect file configuration found';
      }
      return res;
    },
    me: (_, __, { me }) => me,
    config: async (_, __, { conf }) => {
      return await readFile(conf.root, conf.configFile);
    },
    customSchema: async (_, { ns }, { conf }) => {
      return await readFile(conf.root, ns);
    },
    getEntity: async (_, args, ctx) => {
      guard(ctx.auth);
      const { id, type = 'wells', where = '{}' } = args,
        model = ctx.models[type];
      if (!model) return null;
      let res = await model.findOne(id ? { id } : JSON.parse(where));
      if (type === 'person') res = person;
      return res;
    },
    getEntities: async (_, args, ctx) => {
      const {
          type = 'wells',
          params: { where, projection = '', options = { limit: 25 } },
        } = args,
        model = ctx.models[type];
      if (!model) return null;
      ctx.project = projection
        ? (p) => pick(p, projection.split(' '))
        : (p) => omit(p, jsonOmit);

      let cursor = model.getCursor(
        where && JSON.parse(where),
        options
      ); //, options);
      var entities = await cursor.toArray(),
        count = await cursor.count(),
        res = {
          count,
          entities,
        };
      return res;
    },
    count: async (_, { type, where }, ctx) => {
      let res = ctx.models[type].count(where && JSON.parse(where));
      return res;
    },
  },
  User: {
    name: ({ firstName, lastName }) => `${firstName} ${lastName}`,
    id: getId,
  },
  EntityProxy: {
    json: (p = {}, _, ctx) => {
      const entity = ctx.project ? ctx.project(p) : p,
        serializable = omit(entity, ['id', 'createdAt', 'updatedAt']);
      return JSON.stringify(serializable);
    },
  },
  Entity: {
    __resolveType: () => 'EntityProxy',
  },
  Mutation: {
    updateConfig: async (parent, { value }, { conf }) => {
      const model = await requireFromString(value, conf.configFile);
      if (!model)
        throw new UserInputError(error.message, {
          response: 'Incorrect user input',
        });
      const [txt] = await Promise.all([
        writeFile(value, conf.root, conf.configFile),
        processConfig(model, conf),
      ]);
      return txt;
    },
    signin: async (parent, { username }, { models, social }) => {
      let timestamp = new Date(),
        ts = timestamp.valueOf(),
        { email, name, picture, provider } = social,
        session = await cache.get(email, 'session'),
        exists = !!session;
      if (!exists) {
        if (!username) {
          session = {
            social: { email, name, picture, provider },
            expires: ts + tokenLifeLong,
          };
          await cache.set(email, session, {
            ns: 'session',
            ttl: tokenLifeLong,
          });
        } else throw new ApolloError('Session does not exists', 440);
      }

      const [access_token] = await Promise.all([
          generateToken(session, session.expires - ts),
          models.sessions.insertOne({
            type: 'signin',
            request: username ? 'retrieve' : 'create',
            response: exists ? 'retrieved' : 'created',
            username: email,
            ...session,
            timestamp,
          }),
        ]),
        versions = {
          v_lookups: parseInt(V_LOOKUPS),
          v_types: parseInt(V_TYPES),
        };
      // const rt = await verifyToken(access_token, TOKEN_SECRET, true);
      // const rt1 = cache.get(email, 'session');
      return Object.assign(omit(session, ['expires']), {
        username: email,
        access_token,
        versions,
      });
    },
    signout: async (parent, args, { models, auth }) => {
      guard(auth);
      const authed = auth.expired ? auth.token : auth,
        { sub } = authed,
        record = {
          type: 'signout',
          id: sub,
          timesatmp: new Date(),
        };

      await Promise.all([
        models.sessions.insertOne(record),
        cache.remove(sub, 'session'),
      ]);
      return true;
    },
    impersonate: async (parent, { loginInfo }, { models, auth }) => {
      guard(auth);
      const { username, company } = loginInfo,
        { sub } = auth;

      const session = await cache.get(sub, 'session');
      if (!session)
        throw new ApolloError('Session does not exists', 440);
      const timestamp = new Date(),
        ts = timestamp.valueOf();
      const fl = await readFile(
          resourcePath,
          'lookups',
          '_users.json'
        ),
        companies = JSON.parse(fl),
        co = companies.find((c) => c.id === company);
      var user = await models.users.findOne({ username });
      if (!user)
        throw new UserInputError(
          'No user found with this login credentials.'
        );
      Object.assign(user, {
        uom: 'M',
        locale: 'en-CA',
      });
      Object.assign(session, {
        company: { name: co.name, id: co.id },
        user,
      });

      const ttl = session.expires - ts,
        [access_token] = await Promise.all([
          cache.set(sub, session, {
            ns: 'session',
            ttl,
          }),
          generateToken(session, ttl),
          models.sessions.insertOne({
            type: 'impersonate',
            username: sub,
            ...session,
            timestamp,
          }),
        ]);
      delete user.password;

      return {
        user,
        company: session.company,
        access_token,
      };
    },
    token: async (parent, args, { auth }) => {
      const { token } = args,
        { sub, iss } = auth;
      if (iss !== APP_NAME)
        throw new ApolloError('Third-party token.', 400);
      const session = await cache.get(sub, 'session');
      if (!session)
        throw new ApolloError(
          'Can not issue token for unlogged-in user.',
          401
        );
      //should we check is cached token is the same as provided???
      const { username, company, roles } = await verifyToken(
        token,
        TOKEN_SECRET,
        true
      );
      if (!username) throw new ApolloError('Incorrect token.', 400);
      const access_token = await createToken(
        { username, company, roles },
        TOKEN_SECRET,
        { expiresIn: tokenLifeShort, issuer: APP_NAME }
      );
      return access_token;
    },
    signUp: async (
      parent,
      { username, email, password },
      { models, secret }
    ) => {
      const user = await models.users.create({
          username,
          email,
          password,
        }),
        token = await createToken(user, secret, tokenLife);
      return { user, token };
    },
  },
});
// Object.keys(baseResolvers.Query).forEach(
//   (e) => (baseResolvers.Query[e] = protect(baseResolvers.Query[e]))
// );

module.exports = baseResolvers;
