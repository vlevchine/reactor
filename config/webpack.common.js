const postcssNormalize = require("postcss-normalize");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// common function to get style loaders
const hasJsxRuntime = (env) => {
    if (env.DISABLE_NEW_JSX_TRANSFORM === "true") {
      return false;
    }

    try {
      require.resolve("react/jsx-runtime");
      return true;
    } catch (e) {
      return false;
    }
  },
  getStyleLoaders = (cssOptions, isDev, paths) => {
    const loaders = [
      isDev && require.resolve("style-loader"),
      !isDev && {
        loader: MiniCssExtractPlugin.loader,
        // css is located in `static/css`, use '../../' to locate index.html folder
        // in production `paths.publicUrlOrPath` can be a relative path
        options: paths.publicUrlOrPath.startsWith(".")
          ? { publicPath: "../../" }
          : {},
      },
      {
        loader: require.resolve("css-loader"),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve("postcss-loader"),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: "postcss",
          plugins: () => [
            require("postcss-flexbugs-fixes"),
            require("postcss-preset-env")({
              autoprefixer: {
                flexbox: "no-2009",
              },
              stage: 3,
            }),
            // Adds PostCSS Normalize as the reset css with default options,
            // so that it honors browserslist config in package.json
            // which in turn let's users customize the target behavior as per their needs.
            postcssNormalize(),
          ],
          sourceMap: isDev,
        },
      },
    ].filter(Boolean);
    return loaders;
  },
  getAliases = (paths) => {
    return {
      "@app": paths.appSrcClient,
      "@appRoot": paths.appSrc,
      "@appServer": paths.appSrcServer,
    };
  };

module.exports = { hasJsxRuntime, getStyleLoaders, getAliases };
