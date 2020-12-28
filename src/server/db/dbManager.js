const Sequelize = require('sequelize');

//create db in certain location
// const sqlite = require('sqlite3'), db = new sqlite.Database(location);
const connectToDatabase = async (
  modelDefs,
  modelExt,
  conf,
  { logger, reset, drop }
) => {
  const sqlz = new Sequelize('db', 'story_app', 'psw', conf.db);

  if (drop) {
    await sqlz.queryInterface.dropAllTables();
  }
  //types initialized reading models folder
  var models = modelDefs.reduce((acc, fn) => {
    fn && fn(sqlz, Sequelize, acc);
    return acc;
  }, {});

  Object.values(modelExt(models)).forEach((mod) => {
    if ('associate' in mod) {
      mod.associate(models);
    }
  });
  let connection;
  try {
    connection = await sqlz.sync({
      force: reset,
      logging: logger,
    });
    logger('Connected to Database!');
  } catch (err) {
    logger('Failed connect to Database:', err.message);
  }

  return { models, connection };
};

module.exports = { connectToDatabase };
