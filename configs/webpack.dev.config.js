/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

const webpackMerge = require('webpack-merge');
const commonConfig = require('./webpack.common.config.js');
const root = require('./helpers').root;

module.exports = webpackMerge(commonConfig, {

  mode: 'development',

  // Source maps support ('inline-source-map' also works)
  devtool: 'source-map',

  output: {
    path: root('dist/src'),
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  }

});
