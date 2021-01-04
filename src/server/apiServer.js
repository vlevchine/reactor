const { ApolloServer } = require('apollo-server-express'),
  { makeExecutableSchema } = require('graphql-tools'), //mergeSchemas
  { gql } = require('apollo-server-express'),
  {
    getFileNamesFrom,
    getFilesFrom,
    verifyToken,
  } = require('../utils');
var resolverLoc = './resolvers',
  { TOKEN_SECRET } = process.env;

const schemaToDoc = (e) =>
    gql`
      ${e}
    `,
  generateSchema = async (
    schemaLoc,
    loc,
    resourcePath,
    pageTypesLoc
  ) => {
    const resolverList = getFileNamesFrom([loc, resolverLoc], 'js'),
      schemas = await getFilesFrom([schemaLoc], 'graphql'),
      typeDefs = Object.values(schemas).map(schemaToDoc),
      resolvers = resolverList.map((e) =>
        require(`${resolverLoc}/${e}`)({ resourcePath, pageTypesLoc })
      );

    return makeExecutableSchema({
      typeDefs,
      resolvers,
      resolverValidationOptions: {
        requireResolversForResolveType: false,
      },
    });
  },
  startServer = (schema, models, conf) => {
    return new ApolloServer({
      schema,
      // typeDefs, resolvers: [initialResolvers], schemaDirectives,
      context: async ({ req, connection }) => {
        if (req) {
          const res = { models, conf },
            auth = req.get('Authorization')?.split(' ');
          if (auth[0] === 'Bearer') {
            res.auth = await verifyToken(auth[1], TOKEN_SECRET);
          }

          //user = await models.users.findById(auth.user_id);
          return res;
        }
        if (connection) {
          return { models };
        }
      },
      playground: {
        settings: {
          'editor.cursorShape.cursorShape': 'line',
        },
      },
      formatError: (error) => {
        const message = error.message
          .replace('SequelizeValidationError: ', '')
          .replace('Validation error: ', '')
          .replace('Context creation failed: ', '');
        return {
          path: error.path,
          message,
          code: error.extensions.code,
        };
      },
    });
  };

module.exports = { generateSchema, startServer, schemaToDoc };
