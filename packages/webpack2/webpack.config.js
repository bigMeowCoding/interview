const path = require("path");
// const nodeExternals = require('webpack-node-externals');
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const HtmlWebpackPlugin = require("html-webpack-plugin");
const StatoscopeWebpackPlugin = require("@statoscope/webpack-plugin").default;
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
module.exports = {
  entry: "./src/index.js",
  devServer: {
    port: 3001,
  },
  // cache: {
  //   type: "filesystem"
  // },
  output: {
    filename: "[name].js",
    chunkFilename: "[name].chunk.js",
    path: path.resolve(__dirname, "dist"),
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      minSize: 0,
      minChunks: 1,
      cacheGroups: {
        lodash: {
          test: /lodash-es/, // 匹配chunk的名称
          name: "lodash", //打包后的文件名
          priority: 13, // 优先级 越高则先处理
        },
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          priority: 12,
        },
      },
    },
  },

  module: {
    rules: [
      {
        test: /\.js?$/,
        use: [
          {
            loader: "thread-loader",
            options: {
              workers: 2,
              workerParallelJobs: 50,
              // ...
            },
          },
          {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-env", { targets: "ie 11" }]],
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin(),
    new StatoscopeWebpackPlugin(),
    // new BundleAnalyzerPlugin(),
    // new ModuleFederationPlugin({
    //   name: "host",
    //   remotes: {
    //     webpack1: "webpack1@http://localhost:3002/remoteEntry.js",
    //   },
    // }),
  ],
};
