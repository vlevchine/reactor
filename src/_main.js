// These lines make "require" available
// import { createRequire } from 'module';
// const require = createRequire(import.meta.url);
const express = require('express'),
  http = require('http'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  path = require('path'),
  chalk = require('react-dev-utils/chalk'),
  app = express();

const paths = require('../config/paths');
global.appRequire = (dir = '', name = '') =>
  require(path.join(paths.appSrc, dir, name));
global.rootRequire = (dir = '', name = '') =>
  require(path.join(paths.appPath, dir, name));
rootRequire('config/env')(paths.appPath, 'development');
//REFRESH_TOKEN_SECRET
const { API_PORT, API_URI, DEFAULT_PORT } = process.env,
  conf = appRequire('server/conf'),
  port = conf.apiPort || parseInt(API_PORT),
  logger = console.log,
  origin = `http://localhost:${port}`,
  client_uri = origin.replace(port, DEFAULT_PORT),
  gqlEndpoint = [origin, API_URI].join('/'),
  models = appRequire('server/db/dbMongo'),
  { generateSchema, startServer } = appRequire('server/apiServer');

app.use(express.static(paths.appPublic));
app.use(
  require('cors')({
    //      origin: "*",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    origin: client_uri,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//var r = require('crypto').randomBytes(64).toString('hex');
const options = {
  copyBaseDefs: true, //copy _base.graphql to server/schemas and _baseResolvers.js to server/resolvers
  saveModel: true, //save model into server/models folder
  icons: true,
  // drop: true, //drop all tables in database
  // reset: true, //drop and re-create tables
  seed: {
    users: false,
    wells: false,
    lookups: false,
  }, //seed data
};

(async (conf, options) => {
  const init = require('./_init'),
    schema = await init(paths, generateSchema, options);

  require('./server/routes')(app, models, paths.appResources);
  const server = await startServer(schema, models, conf);
  server.applyMiddleware({
    app,
    path: server.graphqlPath,
    cors: true,
  });

  const httpServer = http.createServer(app);
  server.installSubscriptionHandlers(httpServer);
  httpServer.listen({ port }, () => {
    logger(chalk.cyan(`Server ready at ${gqlEndpoint}`));
  });
})(conf, options);

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
