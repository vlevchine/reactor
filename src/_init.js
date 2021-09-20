const path = require('path'),
  { partition } = require('lodash');

const { MONGO_URI, MONGO_DBNAME } = process.env,
  { readFile, writeFile } = require('./utils'),
  models = appRequire('server/db/dbMongo'),
  { cache } = appRequire('server/db/cache'),
  { copyJSONSchemas, processForms } = appRequire(
    'compiler/defManager'
  ),
  compiler = appRequire('compiler');

async function init(paths, generateSchema, options) {
  //copyBaseDefs: true, //copy _base.graphql to server/schemas and _baseResolvers.js to server/resolvers
  //  saveModel;
  const { seed, icons } = options;
  //initialize storage
  await cache.init(path.resolve(paths.appData, 'cache'));
  await models.init(MONGO_URI, MONGO_DBNAME);
  //var table = models.companies;
  //table.insertOne({ id: 111, co: undefined });
  //tesst queries here
  if (seed) {
    const seeds = {};
    if (seed.wells) {
      const { parseWellList } = appRequire('resources/loader'),
        wells_txt = await readFile('src/resources', 'AB_wells.csv'),
        { wells } = parseWellList(wells_txt);
      seeds.wells = wells;
    }
    await models.seed(seeds);
  }
  await preprocessTypes(models, [paths.appClientData, 'types.json']);
  if (icons) {
    await collectIcons(paths, appRequire('resources/app/fa-icons'));
  }

  const schema = await generateSchema(
      paths.appSchemas,
      paths.appSrcServer,
      paths.appResources,
      paths.appPageTypes
    ),
    appMetaLoc = path.resolve(paths.appClientContent, 'meta'),
    //copy basic definitions(schema, models) to main app
    configDir = path.resolve(paths.appResources, 'app'),
    acc = await copyJSONSchemas(schema, configDir),
    appConfig = require(path.resolve(configDir, 'appConfig'));

  await compiler.processAppConfig(acc, appConfig, {
    configDir,
    templateDir: path.resolve(paths.appResources, 'templates'),
    dist: paths.appClientContent,
    confDist: paths.appClientData,
    metaDist: appMetaLoc,
  });

  await processForms('client/forms', acc.types);
  return schema;
}

module.exports = init;

const getRefs = (fields) => {
  const refs = fields
    .filter((f) => f.type === 'ID' && f.ref)
    .map((f) => f.ref);
  return refs.length > 0 ? [...new Set(refs)] : undefined;
};

async function preprocessTypes(models, path) {
  const allTypes = await models.types.find(),
    [primitive, complex] = partition(allTypes, (e) => e.primitive),
    primitives = primitive.map((e) => e.id),
    deps = Object.fromEntries(
      complex
        .map((e) => [e.id, getRefs(e.fields)])
        .filter((e) => e[1])
    ),
    typeDeps = complex.reduce((acc, e) => {
      const lookups = e.fields
          .filter((f) => f.type === 'ID' && f.lookups)
          .map((f) => f.lookups),
        nested = e.fields
          .filter((f) => !primitives.includes(f.type))
          .map((f) => f.type),
        refs = getRefs(e.fields),
        item = {
          name: e.name,
          depends: nested.length > 0 ? [...new Set(nested)] : [],
        };
      if (lookups.length > 0) {
        item.lookups = [...new Set(lookups)];
      }
      if (refs) {
        refs.forEach((r) => handleDependency(r, deps, item.depends));
      }
      if (item.lookups || item.depends.length) acc[e.id] = item;
      return acc;
    }, {});
  writeFile(JSON.stringify(typeDeps), ...path);
}

function handleDependency(name, map, acc) {
  if (!acc.includes(name)) acc.push(name);
  const nodes = map[name];
  if (nodes)
    nodes.forEach((e) => {
      handleDependency(e, map, acc);
    });
}

async function collectIcons(paths, conf) {
  const { loc, spec, res, template } = conf,
    _template = await readFile(paths.appResources, template);

  const files = [],
    repl1 = 'xmlns="http://www.w3.org/2000/svg"',
    repl2 =
      '<!-- Font Awesome Pro 5.15.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) -->';

  Object.entries(spec).forEach(([type, icons]) => {
    const t = type[0];
    icons.forEach((ic) => files.push([type, t, ic]));
  });
  const items = await Promise.all(
      files.map(([type, t, name]) =>
        readFile(paths.appPath, loc, type, `${name}.svg`).then((f) =>
          f
            .replace(repl1, `id="${name}-${t}"`)
            .replace(repl2, '')
            .replace(/svg/g, 'symbol')
        )
      )
    ),
    txt = _template.replace('__content__', items.join('\r\t'));

  return writeFile(txt, paths.appClientData, res);
}

//var r = require('crypto').randomBytes(64).toString('hex');

//app.set('port', port);
// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(
//   bodyParser.urlencoded({ limit: '50mb', extended: true, parameterList: 50000 })
// );
// app.use(function(req, res, next) {
//   var origin = req.headers.origin,
//     requestor = `${req.protocol}://${req.hostname}:${config.appPort}`;
//   if (origin === requestor) {
//     res.header('Access-Control-Allow-Origin', origin);
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header(
//       'Access-Control-Allow-Headers',
//       'Origin, X-Requested-With, Content-Type, Accept'
//     );
//   }
//   next();
// });
//app.use(express.static(dirPublic));

// function onError(error) {
//   if (error.syscall !== 'listen') {
//     throw error;
//   }
//   if (error.code === 'EACCES') {
//     logger.error(port + ' requires ellevated privaleges');
//     process.exit(1);
//   }
//   if (error.code === 'EADDRINUSE') {
//     logger.error(port + ' is already in use');
//     process.exit(1);
//   }
//   throw error;
// }
