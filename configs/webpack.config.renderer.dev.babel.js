/* eslint global-require: off, import/no-dynamic-require: off */

/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
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
const { spawn, execSync } = require('child_process');
// import { spawn, execSync } from 'child_process';
const baseConfig = require('./webpack.config.base');
// import baseConfig from './webpack.config.base';
const CheckNodeEnv = require('../internals/scripts/CheckNodeEnv');
// import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === 'production') {
  CheckNodeEnv('development');
}

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
const dll = path.join(__dirname, '..', 'dll');
const manifest = path.resolve(dll, 'renderer.json');
const requiredByDLLConfig = module.parent.filename.includes(
  'webpack.config.renderer.dev.dll'
);

/**
 * Warn if the DLL is not built
 */
if (!requiredByDLLConfig && !(fs.existsSync(dll) && fs.existsSync(manifest))) {
  console.log(
    chalk.black.bgYellow.bold(
      'The DLL files are missing. Sit back while we build them for you with "yarn build-dll"'
    )
  );
  execSync('yarn build-dll');
}

<<<<<<< HEAD
module.exports = exports = merge.smart(baseConfig, {
  devtool: 'cheap-inline-source-map',
=======
export default merge.smart(baseConfig, {
  // devtool: 'cheap-inline-source-map',
  devtool: 'inline-source-map',
>>>>>>> ba32fa7032ab9b452a48b61eacd2a448b7920415

  mode: 'development',

  target: 'electron-renderer',

  entry: {
    main: [
      ...(process.env.PLAIN_HMR ? [] : ['react-hot-loader/patch']),
      `webpack-dev-server/client?http://localhost:${port}/`,
      'webpack/hot/only-dev-server',
      require.resolve('../app/index'),
    ],
    login: [
      'react-hot-loader/patch',
      `webpack-dev-server/client?http://localhost:${port}/`,
      'webpack/hot/only-dev-server',
      require.resolve('../app/login'),
    ],
  },

  output: {
    publicPath: `http://localhost:${port}/dist/`,
    //filename: 'renderer.dev.js',
    filename: '[name].min.js',
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'less-loader',
          },
        ],
      },
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              // modules: {
              //   localIdentName: '[name]__[local]__[hash:base64:5]',
              // },
              // sourceMap: true,
              importLoaders: 1,
            },
          },
        ],
      },
      // SASS support - compile all .global.scss files and pipe it to style.css
      {
        test: /\.global\.(scss|sass)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      // SASS support - compile all other .scss files and pipe it to style.css
      {
        test: /^((?!\.global).)*\.(scss|sass)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              // modules: {
              //   localIdentName: '[name]__[local]__[hash:base64:5]',
              // },
              sourceMap: true,
              importLoaders: 1,
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream',
          },
        },
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader',
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          },
        },
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader',
      },
    ],
  },
  // optimization: {
  //   splitChunks: {
  //     chunks: 'async',
  //   },
  // },
  resolve: {
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  plugins: [
    requiredByDLLConfig
      ? null
      : new webpack.DllReferencePlugin({
          context: path.join(__dirname, '..', 'dll'),
          manifest: require(manifest),
          sourceType: 'var',
        }),

    new webpack.HotModuleReplacementPlugin({
      multiStep: true,
    }),

    new webpack.NoEmitOnErrorsPlugin(),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     *
     * By default, use 'development' as NODE_ENV. This can be overriden with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  devServer: {
    port,
    publicPath,
    compress: true,
    noInfo: false,
    stats: 'errors-only',
    inline: true,
    lazy: false,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    contentBase: path.join(__dirname, 'dist'),
    watchOptions: {
      aggregateTimeout: 300,
      ignored: /node_modules/,
      poll: 100,
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
    },
    hot: true,
    before() {
      if (process.env.START_HOT) {
        console.log('Starting Main Process...');
        spawn('npm', ['run', 'start-main-dev'], {
          shell: true,
          env: process.env,
          stdio: 'inherit',
        })
          .on('close', code => process.exit(code))
          .on('error', spawnError => console.error(spawnError));
      }
    },
  },
});
