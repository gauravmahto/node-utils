/**
 * Copyright 2018 - Author gauravm.git@gmail.com
 */

const gulp = require('gulp');

const tasks = require('./tasks');
const helpers = require('./../configs/helpers');

const config = {
  destDir: helpers.root('dist'),
  inputSourceFiles: [
    './src/**/*.ts'
  ],
  inputTestFiles: [
    './specs/**/*.ts',
    'typings.d.ts'
  ],
  tsConfigPath: 'tsconfig-spec.json'
};

//region Gulp tasks

gulp.task('cleanSpec', () => tasks.clean(helpers.root(config.destDir, 'specs')));
gulp.task('cleanSrc', () => tasks.clean(helpers.root(config.destDir, 'src')));

gulp.task('compileSpec', ['cleanSpec'], () => tasks.buildTS({
  source: {
    include: [
      helpers.root('specs/**/*.ts'),
      helpers.root('typings.d.ts')
    ]
  },
  dest: {
    src: helpers.root(config.destDir, 'specs')
  },
  ts: {
    configFile: helpers.root('tsconfig-spec.json')
  }
}));

gulp.task('compileSrc', ['cleanSrc'], () => tasks.buildTS({
  source: {
    include: [
      helpers.root('src/app/**/*.ts'),
      helpers.root('src/framework/**/*.ts')
    ]
  },
  dest: {
    src: helpers.root(config.destDir, 'src')
  },
  ts: {
    configFile: helpers.root('tsconfig.json')
  }
}));

gulp.task('compile', ['compileSrc', 'compileSpec']);

gulp.task('test', () => tasks.runTests());

gulp.task('compileSrcForWatch', ['compileSrc'], () => gulp.start('test'));
gulp.task('compileSpecForWatch', ['compileSpec'], () => gulp.start('test'));

gulp.task('watchAndTest', () => {
  gulp.watch(config.inputSourceFiles, ['compileSrcForWatch']);
  gulp.watch(config.inputTestFiles, ['compileSpecForWatch']);
});
gulp.task('watch', () => {
  gulp.watch(config.inputSourceFiles, ['compileSrc']);
  gulp.watch(config.inputTestFiles, ['compileSpec']);
});

// Default gulp task
gulp.task('default', ['compileSpecForWatch']);

//endregion Gulp tasks
