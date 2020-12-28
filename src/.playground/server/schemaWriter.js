const { isNil, isObject } = require('lodash');

const propValue = (val) =>
    isObject(val)
      ? `{ ${Object.entries(val)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')} }`
      : val,
  propToString = (n, v) => {
    return `${n}: ${n === 'type' ? `DataTypes.${v}` : propValue(v)},`;
  },
  metaFields = ['name', 'model', 'fake', 'transform'],
  fieldToString = (n, f) => {
    const attrs = Object.entries(f).filter(
        ([n, v]) => !isNil(v) && !metaFields.includes(n)
      ),
      attr = attrs //[['type', f.type], ...attrs]
        .map(([n, v]) => propToString(n, v))
        .join('\n\t\t\t');
    return `\t${n}: {\n\t\t\t${attr}\n\t\t}`; //`${name}: {\n${Object.entries(attr)}\n}`;
  },
  assocToString = (name, def) => {
    const { assoc, foreignKey } = def,
      isOne = assoc === 'hasOne',
      //    def.through
      //     ? 'belongsToMany'
      //     : def.list
      //     ? 'hasMany'
      //     : isOne
      //     ? 'hasOne'
      //     : 'belongsTo',
      fKey = `${(isOne || def.through || assoc === 'belongsTo'
        ? name
        : def.target
      ).toLowerCase()}Id`;
    return `models['${name}'].${assoc}(models['${def.target}'], {as: '${
      def.as
    }', foreignKey: '${foreignKey || fKey}', ${
      def.through ? `through: '${def.through}', ` : ''
    }}); `; //onDelete: 'CASCADE'
  },
  typeToString = (name, def) => {
    const fields = Object.entries(def.fields)
        .map(([n, f]) => fieldToString(n, f))
        .join(',\n\t'),
      typeDef = `models['${name}'] = sequelize.define('${name}', {\n\t${fields}\n\t});\n`,
      assocs =
        def.associations.length > 0
          ? `\tmodels['${name}'].associate = (models) => {\n\t\t${def.associations
              .map((e) => assocToString(name, e))
              .join('\n\t\t')}\n\t}`
          : '';

    return `//Models: ${name}\n\t${assocs ? `${typeDef}${assocs}\n` : typeDef}`;
  },
  schemaToString = (def) => {
    const keys = Object.keys(def),
      types = keys.map((k) => typeToString(k, def[k])).join('\n\t');
    return `const model = (sequelize, DataTypes, models) => {\n\t${types}\n\treturn models; 
};

module.exports = model;`;
  };

module.exports = { schemaToString };
