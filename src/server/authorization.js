const { ForbiddenError } = require('apollo-server-express'),
  { skip, combineResolvers } = require('graphql-resolvers');

const isAuthenticated = (parent, args, { me }) =>
    me ? skip : new ForbiddenError('Not authenticated as user.'),
  isResourceOwner = async (parent, { id }, { models, me }) => {
    const resource = await models['Message'].findOne({ where: { id } });
    if (resource.userId !== me.id) {
      throw new ForbiddenError('Not authenticated as owner.');
    }
    return skip;
  },
  isAdmin = combineResolvers(
    isAuthenticated,
    (parent, args, { me: { roles } }) =>
      roles.split(',').includes('ADMIN')
        ? skip
        : new ForbiddenError('Not authorized as admin.')
  ),
  withResolver = (middleware, resolver) =>
    combineResolvers(middleware, resolver),
  authenticated = (resolver) => withResolver(isAuthenticated, resolver),
  authorized = (resolver) => withResolver(isResourceOwner, resolver);

module.exports = {
  isAuthenticated,
  withResolver,
  authenticated,
  authorized,
  isAdmin,
};
