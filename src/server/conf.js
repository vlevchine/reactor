const serverLoc = 'server',
  resourceLoc = 'resources',
  conf = {
    host: 'localhost',
    apiPort: 4000,
    apiEndpoint: 'api',
    title: 'My app',
    appPort: 9000,
    mongoDBName: 'storyApp',
    serverLoc,
    schemaLoc: `${resourceLoc}/schemas`,
    modelsLoc: `${serverLoc}/models`,
    resolverLoc: `${serverLoc}/resolvers`,
    pageConfigLoc: './pages',
    defsLoc: '.playground/server/_baseDefs',
    configFile: 'appConfig.js',
    pagesDir: 'pages',
    db: {
      host: 'localhost',
      dialect: 'sqlite',
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    },
  };

module.exports = conf;
