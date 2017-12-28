import * as path from 'path';

global.projectRoot = path.resolve(__dirname);
global.src = path.resolve(global.projectRoot, 'src');
global.specs = path.resolve(global.projectRoot, 'specs');

// Path require base path.
require('app-module-path')  // tslint:disable-line
  .addPath(global.projectRoot);
