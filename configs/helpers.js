/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

const path = require('path');

const projectRoot = path.join(__dirname, '..');

// Returns the absolute path relative to projectRoot path.
module.exports.root = function root(...names) {

  let absoluteRoot = projectRoot;

  if (names.length !== 0) {

    absoluteRoot = path.resolve(projectRoot, names.join(path.sep));

  }

  return absoluteRoot;

};
