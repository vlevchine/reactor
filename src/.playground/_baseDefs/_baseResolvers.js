const {
    AuthenticationError,
    //ForbiddenError,
    UserInputError,
  } = require('apollo-server-express'),
  { GraphQLScalarType } = require('graphql'), //, defaultFieldResolver
  GraphQLJSON = require('graphql-type-json'),
  { GraphQLDate, GraphQLTime, GraphQLDateTime } = require('graphql-iso-date'),
  { pick } = require('lodash'),
  { processConfig } = require('../../.playground/compiler'),
  {
    readFile,
    writeFile,
    requireFromString,
    createToken,
  } = require('../../utils');

const essentials = ['id', 'email', 'userName'],
  tokenLife = '60m',
  getUserProps = (user) => {
    return Object.assign(pick(user, essentials), {
      roles: (user.roles || []).map((e) => e.name),
      name: getName(user),
    });
  },
  getName = (parent) => `${parent.firstName} ${parent.lastName}`;

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

const baseResolvers = {
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
    user: async (parent, args, { models }) => {
      return await models['User'].findOne(args);
    },
    users: async (parent, args, { models }) => {
      return await models['User'].findAll();
    },
    // company: () => ({
    //   make: 'BMW',
    //   model: '330i',
    //   description: 'mine',
    //   id: '1',
    // }),
    me: (_, __, { me }) => me,
    config: async (_, {}, { conf }) => {
      return await readFile([conf.root, conf.configFile]);
    },
    customSchema: async (_, { ns }, { conf }) => {
      return await readFile([conf.root, ns]);
    },
  },
  User: {
    name: getName,
  },
  Mutation: {
    updateConfig: async (parent, { value }, { conf }) => {
      const model = await requireFromString(value, conf.configFile);
      if (!model)
        throw new UserInputError(error.message, {
          response: 'Incorrect user input',
        });
      const [txt] = await Promise.all([
        writeFile([conf.root, conf.configFile], value),
        processConfig(model, conf),
      ]);
      return txt;
    },
    login: async (parent, { id, username, password }, { models, conf }) => {
      const user = await models.User.findOne({
        where: { id },
        include: ['roles'],
      });
      if (!user) {
        throw new UserInputError('No user found with this login credentials.');
      }
      const isValid = true; // await models['User'].validatePassword(user, password);
      if (!isValid) {
        throw new AuthenticationError('Invalid password.');
      }
      const token = await createToken(
        getUserProps(user),
        conf.SECRET,
        tokenLife
      );
      return { user, token };
    },
    signUp: async (
      parent,
      { username, email, password },
      { models, secret }
    ) => {
      const user = await models.User.create({ username, email, password }),
        token = await createToken(user, secret, tokenLife);
      return { user, token };
    },
  },
};

module.exports = baseResolvers;
