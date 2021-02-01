const path = require('path');

const { MONGO_URI, MONGO_DBNAME } = process.env,
  { readFile } = require('./utils'),
  models = appRequire('server/db/dbMongo'),
  { cache } = appRequire('server/db/cache'),
  { copyJSONSchemas, processForms } = appRequire(
    'compiler/defManager'
  ),
  compiler = appRequire('compiler'),
  { demo_copyUsers } = appRequire('resources/loader');

async function init(paths, generateSchema, options) {
  //copyBaseDefs: true, //copy _base.graphql to server/schemas and _baseResolvers.js to server/resolvers
  //  saveModel;
  const { seed } = options;
  //initialize storage
  await cache.init(path.resolve(paths.appData, 'cache'));
  await models.init(MONGO_URI, MONGO_DBNAME);

  if (seed) {
    const seeds = {};
    if (seed.users) {
      const seedData = appRequire('resources/seedData');
      Object.assign(seeds, seedData);
      await demo_copyUsers(paths.appSrcClient, 'appData');
    }
    if (seed.wells) {
      const { load_wells } = appRequire('resources/loader'),
        wells_txt = await readFile('src/resources', 'AB_wells.csv');
      seeds.wells = await load_wells(wells_txt);
    }
    if (seed.lookups) {
      const { lookups } = appRequire('resources/seed_lookups'),
        wells_lk_txt = await readFile(
          'src/resources/lookups',
          'well_lookups.json'
        ),
        wells = JSON.parse(wells_lk_txt);
      seeds.lookups = Object.keys(wells).reduce((acc, k) => {
        acc[k] = { id: k, _id: k, value: wells[k] };
        return acc;
      }, lookups);
    }

    await models.seed(seeds);
  }

  //var rt = await models.wells.find(null, { skip: 1, limit: 2 }); //licensee: 'BG'
  //var users = await models.users.find();

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

// app.get('/', (req, res, next) => {
//   res.sendFile(
//     path.resolve(dirPublic, 'index.html'),
//     {},
//     //{ headers: { 'x-sent': true } },
//     (err) => {
//       var code = res.statusCode;
//       if (err) {
//         next(err);
//       } else {
//         res.end();
//       }
//     }
//   );
// });
//app.use(`/${config.apiEndpoint}`, router);

// app.use((err, _, res, next) => {
//   if (err) {
//     res.status(500).send('Internal server error processing request');
//   } else {
//     next();
//   }
// });
// app.use('*', (req, res, next) => {
//   const err = new Error('Not found');
//   err.status = 404;
//   next(err);
// });

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
