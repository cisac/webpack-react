const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const { merge } = require("webpack-merge");

const modeConfig = (env) => require(`./build-utils/webpack.${env}`)(env);
const presetConfig = require("./build-utils/loadPresets");

module.exports = (params) => {
  const { mode = "production", presets = [] } = params;
  const isEnvProduction = mode === "production";
  return merge(
    {
      mode,
      entry: "./src/index.tsx",
      module: {
        rules: [
          {
            test: /\.(png|jpg|jpeg|gif)$/i,
            type: "asset/resource",
          },

          {
            test: /\.svg$/,
            use: [
              {
                loader: "@svgr/webpack",
                options: {
                  prettier: false,
                  svgo: false,
                  svgoConfig: {
                    plugins: [{ removeViewBox: false }],
                  },
                  titleProp: true,
                  ref: true,
                },
              },
              {
                loader: "file-loader",
                options: {
                  name: "static/media/[name].[hash].[ext]",
                },
              },
            ],
            issuer: {
              and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
            },
          },

          {
            test: /\.(js|jsx|ts|tsx)?$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                cacheDirectory: true,
                cacheCompression: false,
                envName: mode,
              },
            },
          },
        ],
      },
      resolve: {
        extensions: [".tsx", ".ts", ".js"],
      },
      output: {
        filename: "[name].js",
        chunkFilename: "[name].[chunk].js",
      },
      plugins: [
        new HtmlWebpackPlugin(
          Object.assign(
            {},
            {
              template: path.resolve(__dirname, "public/index.html"),
              inject: true,
            },
            isEnvProduction
              ? {
                  minify: {
                    removeComments: true,
                    collapseWhitespace: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    keepClosingSlash: true,
                    minifyJS: true,
                    minifyCSS: true,
                    minifyURLs: true,
                  },
                }
              : undefined
          )
        ),
        new webpack.ProgressPlugin(),
        new webpack.DefinePlugin({
          "process.env.NODE_ENV": JSON.stringify(
            isEnvProduction ? "production" : "development"
          ),
        }),
        new ForkTsCheckerWebpackPlugin({
          async: !isEnvProduction,
        }),
      ],
    },
    modeConfig(mode),
    presetConfig({ mode, presets })
  );
};
