"use strict";

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on("unhandledRejection", (err) => {
  throw err;
});

const checkRequiredFiles = require("react-dev-utils/checkRequiredFiles");
const paths = require("../config/paths");
// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}
const env = require("../config/env")(
  paths.publicUrlOrPath.slice(0, -1),
  "development"
);
const isInteractive = process.stdout.isTTY;
const { checkBrowsers } = require("react-dev-utils/browsersHelper");
const check = () => checkBrowsers(paths.appPath, isInteractive);

module.exports = { paths, env, checkBrowsers: check };
