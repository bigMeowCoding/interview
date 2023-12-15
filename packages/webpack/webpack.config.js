const path = require("path");
// const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;

module.exports = {
  entry: {
    a: "./src/index.js",
    b: "./src/main.js",
  },
  cache: {
    type: 'filesystem'
  },
  devServer: {
    port: 3002,
  },
  output: {
    filename: "[name].js",
    chunkFilename: "[name].chunk.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {},
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin(),

    new ModuleFederationPlugin({
      name: "webpack1",
      filename: "remoteEntry.js",
      exposes: {
        "./sum": "./src/sum.js",
      },
    }),
  ],
  // optimization: {
  //   splitChunks: {
  //     chunks: "all",
  //     minSize: 0,
  //     minChunks: 1,
  //     cacheGroups: {
  //       lodash: {
  //         test: /lodash-es/, // 匹配chunk的名称
  //         name: "lodash", //打包后的文件名
  //         priority: 13, // 优先级 越高则先处理
  //       },
  //       vendor: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name: "vendors",
  //         priority: 12,
  //       },
  //     },
  //   },
  // },
};
