const { mergeTypeFields } = require('./defManager'),
  { readFile, writeFile, createDir, scanFolder } = appRequire(
    'utils'
  ),
  { isString, isPlainObject } = require('lodash');

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
        'page_tabContainer.js',
        'page.css',
      ].map((e) => readFile(templateDir, e))
    );
    return {
      page: { jsGeneric, jsItem, jsNoNav, jsTabContainer, css },
    };
  },
  addIndexFile = async (routes, ...pth) => {
    var applyRoutes = routes.filter(
        (e) => e.comp && e.path && !e.tabs
      ),
      tabbed = routes.filter((e) => e.tabs);
    tabbed.forEach((e) => {
      e.tabs.forEach((t) => {
        applyRoutes.push({
          comp: t.comp,
          path: e.path.replace('*', t.id),
        });
      });
    });
    const imports = [
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
  capitalize = (id) => id.slice(0, 1).toUpperCase() + id.slice(1),
  getComponentName = (str) =>
    str.split('.').map(capitalize).join('_'),
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
  createPageFiles = (routes, templates, existing = []) => {
    const files = routes
      .filter((e) => !e.tabs && !existing.includes(`${e.path}.js`))
      .map((e) => {
        const { comp, params, path } = e,
          template = templates[params ? 'jsItem' : 'jsGeneric'] || '',
          text = template.replace(/T_Page/g, comp);
        return { text, name: `${path}.js` };
      });
    routes
      .filter((e) => e.tabs)
      .forEach((e) => {
        const tabbed = e.tabs
          .map((t) => {
            const name = `${e.path.replace('*', t.id)}.js`,
              text = templates.jsGeneric.replace(/T_Page/g, t.comp);
            return existing.includes(name)
              ? undefined
              : { text, name };
          })
          .filter(Boolean);
        files.push(...tabbed);
      });
    return files;
  },
  join = (pth, id, sep = '.') =>
    [pth, id].filter((e) => !!e).join(sep),
  normalize = (conf = [], pth = '', dflt) => {
    return conf
      .filter((f) => !f.offMenu)
      .map((f) => {
        const { id, items, tabs, title, icon } = f,
          _pth = join(pth, id, `/`),
          res = {
            id,
            label: title,
            icon,
            key: _pth.replace(/\//g, '.'),
          };
        if (items) res.items = normalize(items, _pth, dflt);
        if (tabs) {
          res.tabs = res.items;
          delete res.items;
        }
        if (
          dflt &&
          (f.default || (tabs && items.find((t) => t.default)))
        ) {
          dflt.key = res.key;
        }

        return res;
      });
  },
  addReadGuard = (guard, src, key) => {
    if (guard) {
      if (guard.r) {
        src[key] = guard.r;
      } else if (!guard.w) src[key] = guard;
    }
  },
  collectProps = (f, extra = {}, { schema, guards, db }) => {
    const res = {
      ...f,
      id: extra.key,
      comp: getComponentName(extra.key),
      ...extra,
    };

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
    addReadGuard(res.guard, guards, res.key);
    return res;
  },
  getRoutes = (conf = [], pth = '', acc = [], folders, info) => {
    conf.forEach((f) => {
      const { id, items, tabs } = f,
        _pth = join(pth, id, '/'),
        dotPth = _pth.replace(/\//g, '.'),
        __pth = _pth.replace(/\//g, '\\');
      addReadGuard(f.guard, info.guards, dotPth);
      if (items) {
        folders.push(__pth);

        if (tabs) {
          const tabbed = collectProps(
            f,
            {
              key: dotPth,
              path: _pth + '/*',
              items: undefined,
            },
            info
          );
          acc.push(tabbed);
          tabbed.tabs = items.map((t) => ({
            ...t,
            comp: [tabbed.comp, capitalize(t.id)].join('_'),
          }));
        } else getRoutes(items, _pth, acc, folders, info);
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
      headerLinks = normalize(config.headerLinks),
      { files, folders } = extractFileNames(distFolder),
      reqFolders = [],
      guards = {};
    files.forEach((f, i) => {
      if (f.startsWith('./')) files[i] = f.slice(2);
    });
    let info = {
        schema,
        guards,
        db: config.serverDB,
      },
      mainRoutes = getRoutes(
        config.pages.menu,
        '',
        [],
        reqFolders,
        info
      ),
      parmetrizedRoutes = getRoutes(
        config.pages.offMenu,
        '',
        [],
        reqFolders,
        info
      ),
      pageRoutes = [...mainRoutes, ...parmetrizedRoutes];
    pageRoutes.forEach((r) => {
      r.route = r.route || r.path;
      const params = config.pages.offMenu.find((e) => e.id === r.id)
        ?.params;
      if (params) {
        r.path = ['parameterized', r.path].join('/');
        r.route = [r.route, ...params].join('/:');
      }
      //if (r.tabs)  r.path;  = [r.path, 'index'].join('/');
    });
    const jsFiles = createPageFiles(
        pageRoutes,
        templates.page,
        files
      ),
      fldrs = reqFolders.filter((e) => !folders.includes(e));

    // const jsFiles = pageRoutes.filter(
    //     (e) => !files.includes(`${e.path}.js`)
    //   ),

    await Promise.all(fldrs.map((e) => createDir(dist, e)));
    await Promise.all(
      jsFiles.map((e) => writeFile(e.text, dist, e.name))
    );
    const types = await Promise.all(
        pageRoutes.map((e) => createTypeFile(e, schema, configDir))
      ),
      appTypes = Object.fromEntries(types.filter(Boolean));
    //   inner = routes.map((e) => e.tabs || []).flat();
    // inner.forEach((e) => {
    //   const route = routes.find((r) => r.key === e),
    //     parentId = initial(e.split('.')).join('.'),
    //     parent = routes.find((r) => r.key === parentId);
    //   delete parent.tabs;
    //   if (!parent.items) {
    //     parent.items = [route];
    //   } else {
    //     parent.items.push(route);
    //   }
    // });
    Object.assign(config, {
      menu,
      headerLinks,
      routes: pageRoutes, //.filter((e) => !inner.includes(e.key)),
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
      addIndexFile(pageRoutes, dist, `index.js`),
      writeFile(
        JSON.stringify(config, functionReplacer, '\t'),
        confDist,
        'appConfig.json'
      ),
    ]);
  };

module.exports = { processAppConfig };
