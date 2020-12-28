const {
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLFloat,
    GraphQLBoolean,
    GraphQLObjectType,
    GraphQLSchema,
    GraphQLNonNull,
    GraphQLList,
  } = require('graphql'),
  { mergeSchemas } = require('graphql-tools'),
  { getFilesFrom } = require('../helpers'),
  { directiveSDL } = require('./_baseDefs/directives');

const typeMap = {
  ID: GraphQLID,
  String: GraphQLString,
  Int: GraphQLInt,
  Float: GraphQLFloat,
  Boolean: GraphQLBoolean,
};

const argMap = (args = [], types) =>
    args.reduce(
      (acc, e) => ({
        ...acc,
        [e.name]: {
          type: getTypeClass(e, types),
          description: getDescription(e),
          defaultValue: e.defaultValue,
          args: e.args ? argMap(e.args) : undefined,
        },
      }),
      Object.create(null)
    ),
  descFields = ['description', 'model', 'fake'],
  getTypeClass = ({ type, required, list }, types) => {
    const typ = type ? typeMap[type] || types[type] : typeMap[String],
      innerType = required ? GraphQLNonNull(typ) : typ;
    return list ? GraphQLList(innerType) : innerType;
  },
  getType = ({ name, fields, description }, types) =>
    new GraphQLObjectType({
      name,
      description,
      fields: argMap(
        [{ name: 'id', type: 'ID', required: true }, ...fields],
        types
      ),
      isTypeOf: (value, info) => {
        return true;
      },
    }),
  formatTypeName = ({ type, required, list }) => {
    const inner = required ? `${type}!` : type,
      outer = list ? `[${inner}]!` : inner;
    return outer;
  },
  getDescription = (e, ident = '') => {
    const sep = `\n${ident}`,
      desc = ['description']
        .filter((f) => !!e[f]) //descFields.filter((f) => !!e[f])
        .map(
          (f) => `${f === 'description' ? e[f] : `@${f}(${e[f]})`}`
        );
    return desc.length > 0
      ? [`${ident}"""`, ...desc, '"""'].join(sep)
      : '';
  },
  directiveToString = (def = {}, name) => {
    const item = def[name];
    if (!item) return '';
    const cont = Object.keys(item)
      .map((k) => `${k}: "${item[k]}"`)
      .join(', ');
    return ` @${name}(${cont})`;
  },
  formatField = (def) => {
    const desc = getDescription(def, '\t'),
      line = `\t${def.name}: ${formatTypeName(
        def
      )}${directiveToString(def, 'model')}${directiveToString(
        def,
        'fake'
      )}`;
    return desc ? [desc, line].join('\n') : line;
  },
  stringifyType = (def, ignoreId) => {
    const { name, fields = [] } = def,
      desc = getDescription(def),
      fieldDefs = (ignoreId
        ? fields
        : [{ name: 'id', type: 'ID!' }, ...fields]
      ).map(formatField),
      parts = [desc, `type ${name} {`, ...fieldDefs, '}'];

    return parts.filter((e) => !!e).join('\n');
  },
  stringify = (types = [], queries = [], mutations = []) => {
    const parts = [
      directiveSDL,
      ...types.map(stringifyType),
      stringifyType({ name: 'Query', fields: queries }, true),
      stringifyType({ name: 'Mutation', fields: mutations }, true),
    ];

    return parts.join('\n\n');
  },
  getTypes = (types = [], defaultTypes = {}) =>
    types.reduce(
      (acc, e) => ({ ...acc, [e.name]: getType(e, acc) }),
      defaultTypes
    ),
  getQuery = (queries, types, defaultTypes) => {
    const typeDef = getTypes(types, defaultTypes),
      query = new GraphQLObjectType({
        name: 'Query',
        fields: queries.reduce((acc, e) => {
          const type = typeDef[e.type],
            query = {
              ...acc,
              [e.name]: e.args
                ? { type, args: argMap(e.args) }
                : { type },
            };
          return query;
        }, {}),
      });
    return query;
  };

const getEdgeType = (name) => `
type ${name}Edge {
  cursor: String!
  node: ${name}!
}`,
  getConnectionType = (name) => `
type ${name}Connection {
  edges: [${name}e!]!
  pageInfo: PageInfo!
}`,
  getSortKey = () => `
enum SortKey {
  CREATED_AT
  ID
  NAME
  UPDATED_AT
}`,
  getConnectionField = (type) =>
    `${type.toLowerCase()}s(after: String, before: String, first: Int, last: Int, query: String, reverse: Boolean, sort: ${type}SortKey): ${type}Connection`,
  substituteTypes = ['connection', 'interface'],
  replaceTemplates = (str = '') => {
    const entries = str.split(/{{|}}/),
      extra = '',
      mapped = entries
        .map((e, i) => {
          if (i % 2 === 1) {
            const [type, name] = e.split(':').map(trim);
            if (type === 'connection' && name) {
              extra +=
                getSortKey() +
                getEdgeType(name) +
                getConnectionType(name);
              return getConnectionField(e);
            }
          }

          return e;
        })
        .join('');
  };

// var schema = new GraphQLSchema({ query: queryName });

module.exports = { replaceTemplates };
