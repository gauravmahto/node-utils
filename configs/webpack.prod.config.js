/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const commonConfig = require('./webpack.common.config.js');
const root = require('./helpers').root;

const ENV = process.env.NODE_ENV = process.env.ENV = 'production';

module.exports = webpackMerge(commonConfig, {

  // Source maps support ('inline-source-map' also works)
  devtool: 'source-map',

  output: {
    path: root('dist/src'),
    filename: '[name].[hash].js',
    chunkFilename: '[id].[hash].chunk.js'
  },

  plugins: [

    new webpack.NoEmitOnErrorsPlugin(),

    new webpack.optimize.UglifyJsPlugin({ // https://github.com/angular/angular/issues/10618
      mangle: {
        keep_fnames: true
      }
    }),

    new webpack.DefinePlugin({
      'process.env': {
        ENV: JSON.stringify(ENV)
      }
    })

  ]

});
