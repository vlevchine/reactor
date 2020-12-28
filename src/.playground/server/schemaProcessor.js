const Sequelize = require('sequelize'),
  { fromPairs, isNil, pick, merge } = require('lodash');

const typeAliases = {
    Int: 'INTEGER',
    ID: 'UUID',
    Time: 'DATE',
    DateTime: 'DATE',
  },
  queries = ['Query', 'Mutation'],
  modelProps = ['entity', 'unique', 'validate', 'defaultValue', 'hasOne'],
  getTypeName = (name, kind, scalars) => {
    const upper = name.toUpperCase(),
      text = kind === 'text';
    return upper === 'STRING' && text
      ? 'TEXT'
      : (upper in Sequelize && upper) || typeAliases[name];
  },
  defaultFakes = {
    String: 'hacker.noun',
    Text: 'random.words',
    Int: 'random.number',
    Float: 'random.float',
    Boolean: 'random.boolean',
    ID: 'random.uuid',
    Date: 'date.recent',
  };

const visitType = (t, opts = {}, model) => {
    opts.name = t.name && t.name.value;
    if (t.kind === 'NonNullType') {
      opts[isNil(opts.allowNull) ? 'allowNull' : 'itemAllowNull'] = false;
    }
    if (t.kind === 'ListType') opts.list = true;
    return t.type ? visitType(t.type, opts, model) : opts;
  },
  processDirective = (dir, acc, typeName) => {
    const name = dir.name.value,
      res = fromPairs(dir.arguments.map((a) => [a.name.value, a.value.value]));
    acc[name] = res;
    if (name === 'fake') {
      if (res.any) res.any = res.any.split(',').map((v) => v.trim());
      if (dir.arguments.length === 0 && typeName)
        res.use = defaultFakes[typeName];
      if (!res.use) res.type = typeName;
    }

    return acc;
  },
  processDirectives = (directives = [], typeDef) => {
    const dirs = directives.reduce(
        (acc, e) => processDirective(e, acc, typeDef && typeDef.name),
        { model: {} }
      ),
      res = Object.assign(dirs, typeDef),
      { model, name } = res;
    if (typeDef) res.type = name ? getTypeName(name, model.kind) : 'STRING';
    delete model.kind;
    if (name === 'ID' && !model.defaultValue)
      res.defaultValue = 'DataTypes.UUIDV1';
    if (name === 'Date' && model.allowNull === false)
      res.defaultValue = 'DataTypes.NOW';
    Object.assign(res, pick(model, ['allowNull', 'unique']));

    return res;
  },
  defineSchemaTypes = (defs = []) => {
    return defs
      .filter(
        (e) =>
          e.kind === 'ObjectTypeDefinition' && !queries.includes(e.name.value)
      )
      .reduce((acc, e) => {
        const name = e.name.value,
          tmp = {
            associations: [],
            fields: {},
            type: processDirectives(e.directives),
          };
        if (tmp.type.model.entity === false) return acc;

        e.fields.forEach((f) => {
          let { type, directives = [] } = f,
            fName = f.name.value,
            def = processDirectives(directives, visitType(type)),
            { virtual, through, assoc } = def.model || {};
          if (virtual) return;

          if (def.type) {
            tmp.fields[fName] = def;
          } else {
            tmp.associations.push({
              as: fName,
              source: name,
              target: def.name,
              allowNull: def.allowNull,
              itemAllowNull: def.itemAllowNull,
              list: def.list,
              init: def.fake && def.fake.init,
              through,
              assoc,
            });
          }
        });

        acc[name] = tmp;
        return acc;
      }, {});
  },
  setBelongsToMany = (a, nm) => {
    a.assoc = 'belongsToMany';
    a.through = nm;
  },
  defineTypes = (docs = {}) => {
    //process scalars to augment typeAliases
    docs.forEach((d) => {
      d.definitions
        .filter((e) => e.kind === 'ScalarTypeDefinition')
        .forEach((e) => {
          var dr = e.directives.find((d) => d.name.value === 'model') || {},
            arg = (dr.arguments || []).find((a) => (a.name.value = 'kind'));
          if (arg) typeAliases[e.name.value] = arg.value.value;
        });
    });
    //associations:
    //many-to-many - either have through prop on both sides or both have single list ref to each other
    //one=to-many - either list vs single ref, or list vs no ref
    const typeGroups = docs.map((d) => defineSchemaTypes(d.definitions)),
      groups = typeGroups.map((e) => Object.keys(e)),
      types = merge(...typeGroups);
    Object.keys(types).forEach((t) => {
      types[t].associations.forEach((a) => {
        if (a.assoc) return;
        var tgt = types[a.target] || { associations: [] },
          reverse = tgt.associations.filter((e) => e.target === t),
          to = types[t].associations.filter((e) => e.target === a.target);
        if (a.list) {
          if (a.through) {
            var mutual = reverse.find((e) => e.through === a.through);
            if (mutual) {
              setBelongsToMany(a, a.through);
              setBelongsToMany(mutual, a.through);
            }
          } else {
            if (to.length === 1 && reverse.length === 1 && reverse[0].list) {
              var nm = `${t}${a.target}s`;
              setBelongsToMany(a, nm);
              setBelongsToMany(reverse[0], nm);
            }
            var reversed = reverse.find((e) => !e.list);
            if (reverse.length == 0 || reversed) {
              a.assoc = 'hasMany';
              a.foreignKey = `${a.source.toLowerCase()}Id`;
              if (reversed) {
                reversed.assoc = 'belongsTo';
                reversed.foreignKey = `${a.source.toLowerCase()}Id`;
              } else {
                tgt.associations.push({
                  source: a.target,
                  target: t,
                  as: t.toLowerCase(),
                  assoc: 'belongsTo',
                  foreignKey: a.foreignKey,
                });
              }
            }
          }
        } else if (!a.reverse) a.assoc = 'hasOne';
      });
    });
    return { groups, types };
  };

module.exports = { defineTypes, typeAliases };
