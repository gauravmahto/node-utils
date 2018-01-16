/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

const webpackMerge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const commonConfig = require('./webpack.common.config.js');
const root = require('./helpers').root;

module.exports = webpackMerge(commonConfig, {

  watch: true,

  devtool: 'cheap-module-eval-source-map',

  output: {
    path: root('dist/src'),
    publicPath: '/',
    filename: '[name].js',
    chunkFilename: '[id].chunk.js'
  }

});
