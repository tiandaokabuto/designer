/**
 * Webpack config for production electron main process
 */

// import path from 'path';
const path = require('path');
// import fs from 'fs';
const fs = require('fs');
// import webpack from 'webpack';
const webpack = require('webpack');
// import chalk from 'chalk';
const chalk = require('chalk');
const merge = require('webpack-merge');
// import merge from 'webpack-merge';
const baseConfig = require('./webpack.config.base');
// import baseConfig from './webpack.config.base';
const CheckNodeEnv = require('../internals/scripts/CheckNodeEnv');

const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

CheckNodeEnv('production');

module.exports = merge.smart(baseConfig, {
  devtool: 'source-map',

  mode: 'production',

  target: 'electron-main',

  entry: './app/main.dev',

  output: {
    path: path.join(__dirname, '..'),
    filename: './app/main.prod.js',
  },

  optimization: {
    minimizer: process.env.E2E_BUILD
      ? []
      : [
          new TerserPlugin({
            parallel: true,
            sourceMap: true,
            cache: true,
          }),
        ],
  },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
      START_MINIMIZED: false,
    }),
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },
});
