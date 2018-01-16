/**
 * Copyright 2017 - Author gauravm.git@gmail.com
 */

const root = require('./helpers').root;
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {

  resolve: {
    extensions: [
      '.ts', '.js'
    ],
    alias: {
      src: root('src'),
      app: root('src', 'app'),
      framework: root('src', 'framework')
    }
  },

  entry: {
    app: root('src/client/main.ts'),
    polyfills: root('src/client/polyfills.ts'),
    vendor: root('src/client/vendor.ts')
  },

  module: {

    rules: [{

      test: /\.ts$/,
      include: root('src/client'),
      exclude: root('src/server'),
      use: [{
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: root('src/client/tsconfig.json')
        }
      }, {
        loader: 'angular2-template-loader'
      }]

    }]

  },

  plugins: [

    // new CleanWebpackPlugin([
    //   root('dist/client')
    // ], {
    //   root: root()
    // }),

    new webpack.optimize.CommonsChunkPlugin({
      name: ['app', 'vendor', 'polyfills']
    }),
  ]

};
