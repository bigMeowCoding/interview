const path = require("path");
// const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: "node",
  mode: "development",
  entry: "./src/client/index.js",
  output: {
    filename: "[name].js",
    chunkFilename: "[name].chunk.js",
    path: path.resolve(__dirname, "public"),
  },
  // externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
    ],
  },
  optimization: {
    minimize: false,
    runtimeChunk: {
      name: 'runtime' // 运行时块的文件名
    },

    splitChunks: {
      minSize: 0,
      minChunks: 1,
      cacheGroups: {
        vendor: {
          minSize: 0,
          minChunks: 1,
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
};
