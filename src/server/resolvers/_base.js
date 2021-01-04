const { UserInputError } = require('apollo-server-express'),
  { GraphQLScalarType } = require('graphql'), //, defaultFieldResolver
  { omit, pick } = require('lodash'),
  GraphQLJSON = require('graphql-type-json'),
  {
    GraphQLDate,
    GraphQLTime,
    GraphQLDateTime,
  } = require('graphql-iso-date'),
  { person, guard } = require('../resolverHelpers'),
  { processConfig } = require('../../.playground/compiler'),
  { readFile, writeFile, requireFromString } = require('../../utils');

const getId = (parent) => parent._id;

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
const baseResolvers = ({ pageTypesLoc }) => ({
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
    user: async (parent, { id }, { models }) => {
      return models.users.findById(id);
    },
    users: async (parent, args, ctx) => {
      //TBD - returns all users - for now!!!
      const { auth = {}, models } = ctx,
        users = await models.users.find({ company: auth.company });

      return auth ? users : [];
    },
    pageConfig: async (_, args) => {
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
  },
});
// Object.keys(baseResolvers.Query).forEach(
//   (e) => (baseResolvers.Query[e] = protect(baseResolvers.Query[e]))
// );

module.exports = baseResolvers;
