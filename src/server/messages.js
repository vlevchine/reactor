const Sequelize = require('sequelize'),
  { last } = require('lodash');
//const { authenticated } = require('../authorization');

const cursorOptions = (cursor) =>
    cursor
      ? { where: { createdAt: { [Sequelize.Op.lt]: fromHash(cursor) } } }
      : {},
  toHash = (val) => Buffer.from(val.toString()).toString('base64'),
  fromHash = (string) => Buffer.from(string, 'base64').toString('ascii');

const resolvers = {
  Query: {
    message: async (parent, { id }, { models }) => {
      return models['Message'].findOne({ where: { id } });
    },
    messages: async (parent, { cursor, limit = 25 }, { models }) => {
      var { rows, count } = await models.Message.findAndCountAll({
          limit: limit + 1,
          order: [['createdAt', 'DESC']],
          ...cursorOptions(cursor),
          include: ['author', 'comments'],
        }),
        hasNextPage = rows.length > limit,
        edges = hasNextPage ? rows.slice(0, -1) : rows;
      return {
        edges,
        pageInfo: {
          total: count,
          hasNextPage,
          startCursor: toHash(edges[0].createdAt),
          endCursor: toHash(last(edges).createdAt),
        },
      };
    },
    getMessages: async (parent, { skip = 0, limit = 25 }, { models }) => {
      var { rows, count } = await models.Message.findAndCountAll({
          limit,
          skip,
          order: [['createdAt', 'DESC']],
          include: ['author'],
        }),
        hasNextPage = skip + limit < count;
      return {
        edges: rows,
        pageInfo: {
          total: count,
          hasNextPage,
          startCursor: toHash(rows[0].createdAt),
          endCursor: toHash(last(rows).createdAt),
        },
      };
    },
  },
  Mutation: {
    createMessage: async (parent, { text }, { models, me }) => {
      return models['Message'].create({
        text,
        userId: me.id,
        createdAt: new Date(),
      });
    },
    deleteMessage: async (parent, { id }, { models }) => {
      models['Message'].destroy({ id });
    },
    // createMessage: authenticated(async (parent, { text }, { models, me }) => {
    //   return models['Message'].create({ text, userId: me.id });
    // }),
  },
};

module.exports = resolvers;
