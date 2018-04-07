/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

const root = require('./helpers').root;
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

module.exports = {

  mode: 'none',
  target: 'node',
  externals: [nodeExternals()], // in order to ignore all modules in node_modules folder

  resolve: {
    extensions: [
      '.ts'
    ],
    mainFiles: [
      'index'
    ],
    alias: {
      src: root('src'),
      app: root('src', 'app'),
      framework: root('src', 'framework')
    }
  },

  entry: {
    app: root('src/app/app.ts')
  },

  module: {

    rules: [{

      test: /\.ts$/,
      include: root('src'),
      use: [{
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: root('tsconfig.json')
        }
      }]

    }]

  },

  plugins: [

    new CleanWebpackPlugin([
      root('dist/src')
    ], {
        root: root()
      })

  ]

};
