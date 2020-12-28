'use strict';

const fs = require('fs');
const path = require('path');
const paths = require('./paths');
const { generateHashSync } = require(path.join(
  paths.appSrc,
  'utils'
));
// Make sure that including paths.js after env.js will read .env variables.
delete require.cache[require.resolve('./paths')];

const initEnv = (env) => {
  // Do this as the first thing so that any code reading it knows the right env.
  process.env.BABEL_ENV = env;
  process.env.NODE_ENV = env;
  // https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
  const dotenvFiles = [
    `${paths.dotenv}.${env}.local`,
    // Don't include `.env.local` for `test` environment
    // since normally you expect tests to produce the same
    // results for everyone
    env !== 'test' && `${paths.dotenv}.local`,
    `${paths.dotenv}.${env}`,
    paths.dotenv,
  ]
    .filter(Boolean)
    .filter(fs.existsSync);

  // Load environment variables from .env* files. Suppress warnings using silent
  // if this file is missing. dotenv will never modify any environment variables
  // that have already been set.  Variable expansion is supported in .env files.
  // https://github.com/motdotla/dotenv
  // https://github.com/motdotla/dotenv-expand
  const dotenv = require('dotenv');
  dotenvFiles.forEach((path) => {
    require('dotenv-expand')(dotenv.config({ path }));
  });

  // We support resolving modules according to `NODE_PATH`.
  // This lets you use absolute paths in imports inside large monorepos:
  // https://github.com/facebook/create-react-app/issues/253.
  // It works similar to `NODE_PATH` in Node itself:
  // https://nodejs.org/api/modules.html#modules_loading_from_the_global_folders
  // Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
  // Otherwise, we risk importing Node.js core modules into an app instead of webpack shims.
  // https://github.com/facebook/create-react-app/issues/1023#issuecomment-265344421
  // We also resolve them to make sure all tools using them work consistently.
  const cwd = process.cwd(),
    appDirectory = fs.realpathSync(cwd);
  process.env.NODE_PATH = (process.env.NODE_PATH || '')
    .split(path.delimiter)
    .filter((folder) => folder && !path.isAbsolute(folder))
    .map((folder) => path.resolve(appDirectory, folder))
    .join(path.delimiter);
};
// Grab NODE_ENV and REACT_APP_* environment variables and prepare them to be
// injected into the application via DefinePlugin in webpack configuration.
const REACT_APP = /^REACT_APP_/i;

function getClientEnvironment(publicUrl, env) {
  if (!env) {
    throw new Error(
      'The NODE_ENV environment variable is required but was not specified.'
    );
  }
  initEnv(env);
  const keys = Object.keys(process.env).filter((key) =>
      REACT_APP.test(key)
    ),
    raw = keys.reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      },
      {
        // Useful for determining whether we’re running in production mode.
        // Most importantly, it switches React into the correct mode.
        NODE_ENV: process.env.NODE_ENV || 'development',
        // Useful for resolving the correct path to static assets in `public`.
        // For example, <img src={process.env.PUBLIC_URL + '/img/logo.png'} />.
        // This should only be used as an escape hatch. Normally you would put
        // images into the `src` and `import` them in code to get their paths.
        PUBLIC_URL: publicUrl,
        // We support configuring the sockjs pathname during development.
        // These settings let a developer run multiple simultaneous projects.
        // They are used as the connection `hostname`, `pathname` and `port`
        // in webpackHotDevClient. They are used as the `sockHost`, `sockPath`
        // and `sockPort` options in webpack-dev-server.
        WDS_SOCKET_HOST: process.env.WDS_SOCKET_HOST,
        WDS_SOCKET_PATH: process.env.WDS_SOCKET_PATH,
        WDS_SOCKET_PORT: process.env.WDS_SOCKET_PORT,
        // Whether or not react-refresh is enabled.
        // react-refresh is not 100% stable at this time,
        // which is why it's disabled by default.
        // It is defined here so it is available in the webpackHotDevClient.
        FAST_REFRESH: process.env.FAST_REFRESH !== 'false',
        DEFAULT_PORT: process.env.DEFAULT_PORT,
        HOST: process.env.HOST,
        CI: process.env.CI,
        HTTPS: process.env.HTTPS,
        API_PORT: process.env.API_PORT,
        API_HOST: process.env.API_HOST,
        API_URI: process.env.API_URI,
        API_KEY: process.env.API_KEY,
        APP_NAME: process.env.APP_NAME,
        GOOGLE_ID: process.env.GOOGLE_ID,
        GOOGLE_HASH: generateHashSync(process.env.GOOGLE_PASSWORD),
        FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
      }
    );
  // Stringify all values so we can feed into webpack DefinePlugin
  const stringified = {
    'process.env': Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {}),
  };

  return { raw, stringified };
}

module.exports = getClientEnvironment;
