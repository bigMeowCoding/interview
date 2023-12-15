const path = require("path");
// const nodeExternals = require('webpack-node-externals');

module.exports = {
  target: "node",
  mode: "development",
  entry: "./src/client/index.js",
  output: {
    filename: "index.js",
    // chunkFilename: "[name].chunk.js",
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

};
