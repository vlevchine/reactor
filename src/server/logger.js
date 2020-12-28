const { createLogger, format, transports } = require('winston');

const console = new transports.Console({
    name: 'debug-console',
    level: 'debug',
    prettyPrint: true,
    json: false,
    colorize: true,
    stderrLevels: [],
  }),
  logger = createLogger({
    level: 'debug',
    format: format.simple(),
    transports: [console],
    exitOnError: false,
  });

module.exports = logger;
