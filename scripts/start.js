'use strict';

const chalk = require('react-dev-utils/chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');

const {
  paths,
  env,
  checkBrowsers,
  isInteractive,
} = require('./common');
const createDevServerConfig = require('../config/webpackDevServer.config');
const { DEFAULT_PORT, HOST, HTTPS, CI } = env.raw;
const { name, proxy } = require(paths.appPackageJson);

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
checkBrowsers()
  .then((res) => {
    console.log(chalk.cyan(res));
    // We attempt to use the default port but if it is busy, we offer the user to
    // run on a different port. `choosePort()` Promise resolves to the next free port.
    return choosePort(HOST, parseInt(DEFAULT_PORT));
  })
  .then((port) => {
    if (port == null) {
      // We have not found a port.
      return;
    }
    const config = require('../config/webpack.config')(env);
    const protocol = HTTPS === 'true' ? 'https' : 'http';

    const urls = prepareUrls(
      protocol,
      HOST,
      port,
      paths.publicUrlOrPath.slice(0, -1)
    );
    const devSocket = {
      warnings: (warnings) =>
        devServer.sockWrite(devServer.sockets, 'warnings', warnings),
      errors: (errors) =>
        devServer.sockWrite(devServer.sockets, 'errors', errors),
    };
    // Create a webpack compiler that is configured with custom messages.
    const compiler = createCompiler({
      appName: name,
      config,
      devSocket,
      urls,
      useYarn: false,
      useTypeScript: false,
      tscCompileOnError: false,
      webpack,
    });
    // Load proxy config
    const proxyConfig = prepareProxy(
      proxy,
      paths.appPublic,
      paths.publicUrlOrPath
    );
    // Serve webpack assets generated by the compiler over a web server.
    const serverConfig = createDevServerConfig(
      proxyConfig,
      urls.lanUrlForConfig
    );
    const devServer = new WebpackDevServer(compiler, serverConfig);
    // Launch WebpackDevServer.
    devServer.listen(port, HOST, (err) => {
      if (err) {
        return console.log(err);
      }
      if (isInteractive) {
        clearConsole();
      }

      console.log(chalk.cyan('Starting the development server...\n'));
      openBrowser(urls.localUrlForBrowser);
    });

    ['SIGINT', 'SIGTERM'].forEach(function (sig) {
      process.on(sig, function () {
        devServer.close();
        process.exit();
      });
    });

    if (CI !== 'true') {
      // Gracefully exit when stdin ends
      process.stdin.on('end', function () {
        devServer.close();
        process.exit();
      });
    }
  })
  .catch((err) => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
