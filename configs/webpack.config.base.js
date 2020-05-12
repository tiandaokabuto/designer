/**
 * Base webpack config used across other specific configs
 */

const path = require('path');
// import path from 'path';
const webpack = require('webpack');
// import webpack from 'webpack';
const { dependencies: externals } = require('../app/package.json');
// import { dependencies as externals } from '../app/package.json';

const threadLoader = require('thread-loader');
threadLoader.warmup(
  {
    // pool options, like passed to loader options
    // must match loader options to boot the correct pool
  },
  [
    // modules to load
    // can be any module, i. e.
    'babel-loader',
  ]
);

module.exports = exports = {
  externals: [...Object.keys(externals || {})],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'thread-loader',
            options: {
              workerParallelJobs: 50,
              // workerNodeArgs: ['--max-old-space-size', '1024'],
            },
          },
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
      {
        test: /node_modules[/\\](iconv-lite)[/\\].+/,
        resolve: {
          aliasFields: ['main'],
        },
      },
    ],
  },

  output: {
    path: path.join(__dirname, '..', 'app'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    modules: [path.join(__dirname, '..', 'app'), 'node_modules'],
    alias: {
      '@': path.join(__dirname, '..', 'app'),
      // '@ant-design/icons/lib/dist$': path.resolve(__dirname, './src/icons.js'),
    },
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
    }),

    new webpack.NamedModulesPlugin(),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-cn/),
    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
};
