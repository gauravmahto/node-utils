/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

let webPackConfig;

if (process.env.ENV === 'production') {
  // Production
  webPackConfig = require('./configs/webpack.prod.config.js');
} else {
  // Development and test
  webPackConfig = require('./configs/webpack.dev.config.js');
}

module.exports = webPackConfig;
