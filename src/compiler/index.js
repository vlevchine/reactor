const { mergeTypeFields } = require('./defManager'),
  { readFile, writeFile, createDir, scanFolder } = appRequire(
    'utils'
  ),
  { isString, initial, isPlainObject } = require('lodash');

const functionReplacer = (_, value) =>
  typeof value === 'function'
    ? { function: true, body: value.toString() }
    : value;

const readTemplates = async (templateDir) => {
    var [
      jsGeneric,
      jsItem,
      jsNoNav,
      jsTabContainer,
      css,
    ] = await Promise.all(
      [
        'page_generic.js',
        'page_item.js',
        'page_no_nav.js',
        // 'page_tabContainer.js',
        'page.css',
      ].map((e) => readFile(templateDir, e))
    );
    return {
      page: { jsGeneric, jsItem, jsNoNav, jsTabContainer, css },
    };
  },
  addIndexFile = async (routes, ...pth) => {
    var applyRoutes = routes.filter((e) => e.comp && e.path),
      imports = [
        `import { wrapPage } from '@app/helpers';`,
        ...applyRoutes.map(
          (e) =>
            `import ${e.comp}, {config as config_${e.comp}} from './${e.path}';`
        ),
      ].join('\r\n'),
      content = `${applyRoutes
        .map(
          (e) => `${e.comp}: wrapPage(${e.comp}, config_${e.comp})`
        )
        .join(', ')}`,
      txt = [
        imports,
        'const content = {',
        content,
        '};',
        'export default content;',
      ];

    return writeFile(txt.join('\r\n\r\n'), ...pth);
  },
  collectDependencies = (deps = [], types, acc) => {
    if (!acc) acc = new Set();
    deps.forEach((e) => {
      acc.add(e);
      const obj = types[e];
      obj &&
        obj.depends &&
        collectDependencies(obj.depends, types, acc);
    });
    return acc;
  },
  getComponentName = (id) =>
    id.slice(0, 1).toUpperCase() + id.slice(1),
  //containerId = (id) => `_${id}`,
  createTypeFile = async (def, commonSchema, configDir) => {
    const { queryTypes = [], dataQuery = [], schema, key } = def,
      qrs = Array.isArray(dataQuery) ? dataQuery : [dataQuery],
      qts = Array.isArray(queryTypes) ? queryTypes : [queryTypes],
      qt = qrs.map((e) => e.valueType).concat(qts);
    if (qt.length === 0 && !schema) return undefined;

    const types = [
      ...collectDependencies(qt, commonSchema.types),
    ].reduce(
      (acc, e) => ({
        ...acc,
        [e]: commonSchema.types[e],
      }),
      Object.create(null)
    );
    if (schema) {
      const items = await readFile(configDir, `${schema}.graphql`);
      Object.assign(
        types,
        mergeTypeFields(items, commonSchema.types)
      );
    }

    if (types) {
      const lk = Object.values(types)
        .map((e) => e.lookups || [])
        .flat();
      def.lookups = [...new Set(lk)];
      //def.queryTypes = qt;
    }

    return [key, Object.keys(types)];
    //writeFile( path,  SON.stringify(types, null, '\t'), `${key}.types.json`    );
  },
  addPageFile = async (def, path, templates) => {
    const { tabs, comp, params } = def,
      template =
        templates[
          tabs ? 'jsGeneric' : params ? 'jsNoNav' : 'jsItem'
        ] || '',
      text = template.replace(/T_Page/g, comp);
    return writeFile(text, path, `${def.path}.js`);
  },
  join = (pth, id, sep = '.') =>
    [pth, id].filter((e) => !!e).join(sep),
  normalize = (conf = [], pth = '', dflt) => {
    return conf.map((f) => {
      const { id, items, title, icon } = f,
        _pth = join(pth, id, `/`),
        res = {
          id,
          label: title,
          icon,
          key: _pth.replace(/\//g, '.'),
        };
      if (items) {
        res.items = normalize(items, _pth, dflt);
      } else {
        res.path = _pth;
        res.route = id;
      }
      if (
        dflt &&
        (f.default || (f.tabs && f.tabs.find((t) => t.default)))
      ) {
        dflt.key = res.key;
      }
      if (f.tabs)
        res.tabs = f.tabs.map((t) => [res.key, t.id].join('.'));

      return res;
    });
  },
  collectProps = (f, extra = {}, { schema, guards, db }) => {
    const res = {
      ...f,
      route: f.id,
      comp: getComponentName(f.id),
      ...extra,
    };
    if (f.tabs && !f.markup) {
      delete res.path;
    }

    if (res.dataQuery) {
      if (isPlainObject(res.dataQuery)) {
        res.dataQuery = [res.dataQuery];
      } else if (isString(res.dataQuery)) {
        res.dataQuery = [{ name: res.dataQuery }];
      }
      res.dataQuery.forEach((q) => {
        var qtyp = schema.queries[q.name],
          entityQuery = db.entityQueries[q.type];
        if (!q.valueType) {
          q.valueType = qtyp
            ? qtyp.entity || qtyp.type
            : db.entityMap[q.name];
        }
        if (entityQuery) {
          q.use = entityQuery.name;
          q.useFields = entityQuery.fields;
        }
      });
    }
    if (res.guard) {
      guards[res.key] = res.guard;
      //res.guard = true;
    }

    return res;
  },
  getRoutes = (conf = [], pth = '', acc = [], folders, info) => {
    conf.forEach((f) => {
      const { id, items, tabs } = f,
        _pth = join(pth, id, '/'),
        dotPth = _pth.replace(/\//g, '.'),
        __pth = _pth.replace(/\//g, '\\');
      if (f.guard) {
        info.guards[dotPth] = f.guard;
        //f.guard = true;
      }
      if (items) {
        folders.push(__pth);
        getRoutes(items, _pth, acc, folders, info);
      } else if (tabs) {
        folders.push(__pth);
        acc.push(
          collectProps(
            f,
            {
              key: dotPth,
              path: join(pth, `_${id}`, '/'),
              tabs: tabs.map((t) => join(dotPth, t.id, '.')),
            },
            info
          )
        );
        getRoutes(tabs, _pth, acc, folders, info);
      } else {
        const val = collectProps(
          f,
          {
            path: _pth,
            key: dotPth,
          },
          info
        );
        if (f.default) {
          val.default = true;
        }
        acc.push(val);
      }
    });
    return acc;
  },
  extractFileNames = (fld, acc = { files: [], folders: [] }) => {
    fld.relativeName && acc.folders.push(fld.relativeName);
    fld.files &&
      acc.files.push(
        ...fld.files.map((f) =>
          join(fld.relativeName, f, '\\').replace(/\\/g, '/')
        )
      );
    fld.folders &&
      fld.folders.forEach((f) => extractFileNames(f, acc));
    return acc;
  },
  processAppConfig = async (schema, config, options) => {
    let {
        templateDir,
        dist,
        metaDist,
        confDist,
        configDir,
      } = options,
      templates = await readTemplates(templateDir);

    const distFolder = scanFolder('', dist),
      dflt = {},
      menu = normalize(config.pages.menu, '', dflt),
      headerLinks = normalize(config.pages.headerLinks),
      pages = [
        { id: 'headerLinks', items: config.pages.headerLinks },
        ...config.pages.menu,
        ...config.pages.offMenu,
      ],
      { files, folders } = extractFileNames(distFolder),
      reqFolders = [],
      guards = {};
    files.forEach((f, i) => {
      if (f.startsWith('./')) files[i] = f.slice(2);
    });
    let routes = getRoutes(pages, '', [], reqFolders, {
        schema,
        guards,
        db: config.serverDB,
      }),
      pageRoutes = routes.filter((r) => r.path),
      jsFiles = pageRoutes.filter(
        (e) => !files.includes(`${e.path}.js`)
      ),
      fldrs = reqFolders.filter((e) => !folders.includes(e));
    routes.forEach((r) => {
      var prt = routes.find((p) => `${p.key}.${r.id}` === r.key);
      if (prt) r.fullRoute = `${prt.route}/${r.route}`;
      if (r.default) dflt.route = r.fullRoute || r.route;
    });
    await Promise.all(fldrs.map((e) => createDir(dist, e)));
    await Promise.all(
      jsFiles.map((e) => addPageFile(e, dist, templates.page))
    );
    const types = await Promise.all(
        routes.map((e) => createTypeFile(e, schema, configDir))
      ),
      appTypes = Object.fromEntries(types.filter(Boolean)),
      inner = routes.map((e) => e.tabs || []).flat();
    inner.forEach((e) => {
      const route = routes.find((r) => r.key === e),
        parentId = initial(e.split('.')).join('.'),
        parent = routes.find((r) => r.key === parentId);
      delete parent.tabs;
      if (!parent.items) {
        parent.items = [route];
      } else {
        parent.items.push(route);
      }
    });
    Object.assign(config, {
      menu,
      headerLinks,
      routes: routes.filter((e) => !inner.includes(e.key)),
      defaultPage: dflt,
      // .map((e) => ({ ...e, items: e.tabs, tabs: undefined })),
      pages: undefined,
      guards,
    });

    delete config.serverDB;

    return Promise.all([
      writeFile(
        JSON.stringify(appTypes, null, '\t'),
        metaDist,
        'appTypes.json'
      ),
      addIndexFile(routes, dist, `index.js`),
      writeFile(
        JSON.stringify(config, functionReplacer, '\t'),
        confDist,
        'appConfig.json'
      ),
    ]);
  };

module.exports = { processAppConfig };
