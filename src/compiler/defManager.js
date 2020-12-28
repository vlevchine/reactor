const glob = require('glob'),
  { last } = require('lodash'),
  { gql } = require('apollo-boost'),
  { writeFile, readFile, getPath } = appRequire('utils');

const runGlob = async (path, pattern) => {
    return new Promise((resolve, reject) => {
      glob(pattern, { cwd: getPath([path]) }, async function (
        er,
        files
      ) {
        if (er) reject(er);
        resolve(files);
      });
    });
  },
  sep = '{...props}',
  getLookups = (schema) => {
    return Object.values(schema)
      .map((e) => e.lookups || [])
      .flat();
  },
  replaceProp = (str, { s, e }, replacer, { sep, after = 0 }) => {
    let start = str.indexOf(s),
      res;
    if (start > -1) {
      res = [
        str.slice(0, start),
        replacer,
        str.slice(str.indexOf(e, start) + 1),
      ];
    } else {
      start = str.indexOf(sep, after) + sep.length + 2;
      res =
        start > -1
          ? [
              str.slice(0, start),
              '\t' + replacer + '\r\n',
              str.slice(start),
            ]
          : [str];
    }
    return res.join('');
  },
  processForms = async (path, common) => {
    const [jsFiles, gqlFiles, configFileNames] = await Promise.all([
        runGlob(path, '*/**/*.js'),
        runGlob(path, '*/**/*.graphql'),
        runGlob(path, '**/*.config.json'),
      ]),
      configFiles = (
        await Promise.all(
          configFileNames.map((e) => readFile(path, e))
        )
      ).map(JSON.parse);

    await Promise.all(
      jsFiles.map(async (f) => {
        const name = f.replace('.js', ''),
          schName = name + '.graphql',
          jsonName = name + '.graphql.json';
        if (!gqlFiles.includes(schName)) return;

        let [jsStr, txt] = await Promise.all([
          readFile(path, f),
          readFile(path, schName),
        ]);

        const schema = mergeTypeFields(txt, common);
        configFiles.forEach((c) => {
          c.forEach((e) => {
            (e.items || []).forEach((t) => {
              const id = [e.path, t.path].join('/');
              if (id === name) {
                t.lookups = getLookups(schema);
              }
            });
          });
        });
        let qtStr = `queryTypes={[${Object.keys(schema).map(
            (e) => `'${e}'`
          )}]}`,
          jsStr1 = replaceProp(
            jsStr,
            { s: 'queryTypes={', e: '}' },
            qtStr,
            { sep }
          ),
          jsStr2 = replaceProp(
            jsStr1,
            { s: 'schema={', e: '}' },
            'schema={schema}',
            { sep }
          ),
          importStr = `import schema from '${
            './' + last(jsonName.split('/'))
          }';\r\n`;
        if (jsStr2.indexOf(importStr) === -1)
          jsStr2 = importStr + jsStr;

        return Promise.all([
          writeFile(
            JSON.stringify(schema, null, '\t'),
            path,
            jsonName
          ),
          writeFile(jsStr2, path, f),
        ]);
      })
    );
    return Promise.all(
      configFiles.map((e, i) =>
        writeFile(
          JSON.stringify(e, null, '\t'),
          path,
          configFileNames[i]
        )
      )
    );
  },
  propMap = {
    NonNullType: 'required',
    NonNullType_: 'itemRequired',
    ListType: 'multi',
  },
  handleType = (type, res) => {
    if (type.type) {
      const name = res.multi ? type.kind + '_' : type.kind;
      res[propMap[name]] = true;
      return type.type;
    }
    return type;
  },
  processDirctv = (directives) => {
    return directives.reduce((acc, d) => {
      acc[d.name.value] = d.arguments.reduce(
        (acc1, a1) => ({
          ...acc1,
          [a1.name.value]: a1.value.value,
        }),
        Object.create(null)
      );
      return acc;
    }, Object.create(null));
  },
  processArg = (f, prnt) => {
    let res = { name: f.name.value };
    if (f.directives.length > 0) {
      var dirs = processDirctv(f.directives);
      if (dirs.ref && dirs.ref.lookups) {
        prnt.lookups.push(dirs.ref.lookups);
        res.ref = dirs.ref.lookups;
        delete dirs.ref.lookups;
        if (!Object.keys(dirs.ref).length) {
          delete dirs.ref;
        }
      }
      if (Object.keys(dirs).length > 0) res.directives = dirs;
    }

    res.type = handleType(
      handleType(handleType(f.type, res), res),
      res
    ).name.value;
    return res;
  },
  processFields = (fields) => {
    return Object.values(fields).reduce((acc, e) => {
      const val = { type: e.type.name || e.type.ofType.name };
      if (e.astNode.directives.length > 0) {
        e.astNode.directives.forEach(
          (d) => (val[d.name.value] = d.arguments[0].value.value)
        );
      }
      if (e.astNode.arguments.length > 0) {
        val.args = e.astNode.arguments.map(processArg);
      }
      acc[e.name] = val;
      return acc;
    }, Object.create(null));
  },
  updateDependencies = (obj, depList, types, commonTypes) => {
    if (!obj.depends) return;
    obj.depends.forEach((e) => {
      const dep = types[e];
      if (dep) {
        if (!dep.depends) return;
        dep.depends.forEach((d) => {
          if (d !== obj.name && !depList.includes(d)) {
            depList.push(d);
            updateDependencies(dep, depList, types, commonTypes);
          }
        });
      } else {
        if (commonTypes[e]) {
          types[e] = commonTypes[e];
          depList.push(e);
          if (types[e].depends) {
            types[e].depends.forEach((d) => {
              if (commonTypes[d]) {
                types[d] = commonTypes[d];
                depList.push(d);
              }
            });
          }
        }
      }
    });
  },
  processTypeFields = (defs, commonTypes) => {
    const scalars = Object.keys(commonTypes).filter(
        (e) => !commonTypes[e].fields
      ),
      types = defs.reduce((acc, e) => {
        const { name, directives, fields } = e,
          res = { lookups: [] };
        res.fields = Object.values(fields).map((f) =>
          processArg(f.astNode || f, res)
        );
        const depends = res.fields
          .filter((f) => !scalars.includes(f.type))
          .map((f) => f.type);

        if (res.lookups.length === 0) {
          delete res.lookups;
        } else {
          res.lookups = [...new Set(res.lookups)];
        }
        if (depends.length > 0) {
          res.depends = [...new Set(depends)];
        }
        processDirctv(directives, res);
        acc[name.value] = res;
        return acc;
      }, Object.create(null));
    //add dependencies all the way through tree
    const depTypes = Object.values(types).filter((e) => e.depends);
    depTypes.forEach((e) => {
      updateDependencies(e, e.depends, types, commonTypes);
      //update lookups per dependencies
      const acc = e.lookups || [];
      e.depends.forEach((d) => {
        types[d].lookups && acc.push(...types[d].lookups);
      });
      if (acc.length > 0) e.lookups = [...new Set(acc)];
    });

    return types;
  },
  mergeTypeFields = (txt, schema) => {
    const defs = gql`
        ${txt}
      `.definitions,
      typeDefs = defs.filter(
        (e) => e.kind === 'ObjectTypeDefinition'
      );
    return processTypeFields(typeDefs, schema);
  },
  specials = ['Query', 'Mutation'],
  objTypes = ['GraphQLObjectType', 'GraphQLInterfaceType'],
  copyJSONSchemas = async (schema, to) => {
    const typeList = schema.getTypeMap(),
      typeDefs = Object.values(typeList).filter(
        (e) =>
          !e.name.startsWith('__') &&
          objTypes.includes(e.constructor.name) &&
          !specials.includes(e.name)
      ),
      scalarTypes = Object.values(typeList)
        .filter((e) => e.constructor.name === 'GraphQLScalarType')
        .reduce(
          (acc, e) => ({ ...acc, [e.name]: Object.create(null) }),
          Object.create(null)
        ),
      defs = typeDefs.map((e) => ({
        name: e.astNode.name,
        directives: e.astNode.directives,
        fields: e._fields,
      })),
      queries = processFields(schema.getQueryType().getFields()),
      mutations = processFields(schema.getMutationType().getFields()),
      types = processTypeFields(defs, scalarTypes),
      res = {
        queries,
        mutations,
        types,
      };

    // Object.values(queries).forEach((q) => {
    //   const typ = q.entity || q.type,
    //     type = types[typ];
    //   if (type) {
    //     q.depends = type.depends;
    //     q.lookups = type.lookups;
    //   }
    // });
    Object.assign(res.types, scalarTypes);
    await Promise.all(
      Object.entries(res).map(([k, v]) =>
        writeFile(JSON.stringify(v, null, '\t'), to, `${k}.json`)
      )
    );
    return res;
  };

module.exports = {
  processForms,
  mergeTypeFields,
  copyJSONSchemas,
};
