/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

const gulp = require('gulp');
const gutil = require('gulp-util');

const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');

const mocha = require('gulp-mocha');
const del = require('del');

function onError(error) {

  gutil.log(error);
  this.emit('end');

}

/**
 * Cleans the provided dir.
 * @param {string} dir The directory to clean.
 */
function clean(dir) {

  return del([
    dir
  ]);

}

/**
 * Trans-compile TS to JS.
 * @param {object} opts
 * @param {object} opts.source
 * @param {Array} opts.source.include
 * @param {object} opts.ts
 * @param {string} opts.ts.configFile
 */
function buildTS(opts) {

  const tsProject = ts.createProject(opts.ts.configFile, {
    sourceMap: false
  });

  return gulp
    .src(opts.source.include)
    .pipe(sourcemaps.init())
    .pipe(tsProject(ts.reporter.fullReporter(true)))
    .on('error', onError)
    .pipe(sourcemaps.write('.', {
      sourceRoot: file => {
        return file.cwd;
      }
    }))
    .pipe(gulp.dest(opts.dest.src));

}

/**
 * Run the unit tests.
 */
function runTests() {

  return gulp
    .src('./dist/specs/**/*.js', { read: false })
    .pipe(mocha({
      reporter: 'spec',
      timeout: 5000,
      require: ['source-map-support/register']
    }))
    .on('error', onError);

}

module.exports = {
  clean: clean,
  buildTS: buildTS,
  runTests: runTests
};
