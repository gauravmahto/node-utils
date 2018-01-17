/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

const root = require('./helpers').root;
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {

  target: 'node',

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

  // entry: {
  //   specs: root('specs/index.ts')
  // },

  // Source maps support ('inline-source-map' also works)
  devtool: 'source-map',

  output: {
    path: root('dist/specs'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  },

  module: {

    rules: [{

      test: /\.ts$/,
      include: root('src'),
      use: [{
        loader: 'awesome-typescript-loader',
        options: {
          paths: [
            root('specs', '**/*ts')
          ],
          configFileName: root('tsconfig.json')
        }
      }]

    }]

  },

  plugins: [

    new CleanWebpackPlugin([
      root('dist/specs')
    ], {
        root: root()
      })

  ]

};
