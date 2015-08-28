var gulp    = require('gulp');
var tslint  = require('gulp-tslint');
var exec    = require('child_process').exec;
var jasmine = require('gulp-jasmine');
var gulp    = require('gulp-help')(gulp);
var concatFilenames   = require('gulp-concat-filenames');
var shell  = require('gulp-shell');
var runseq = require('run-sequence');

var paths = {
  tscripts : {
    src : ['src/*.ts'],
    dest : 'lib' }
};

gulp.task('tslint', 'Lints all TypeScript source files', function(){
  return gulp.src('src/**/*.ts')
  .pipe(tslint())
  .pipe(tslint.report('verbose'));
});

gulp.task('build', 'Compiles all TypeScript source files', function (cb) {
  exec('tsc', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });

  require('fs').writeFileSync('lib/build-date.txt', new Date());

  // compile all type definition files (lib/**.d.ts) into one .d.ts
  // /// <reference path="node/node.d.ts" />
  gulp.src('lib/*.d.ts')
      .pipe(concatFilenames('tsd.d.ts', {
        prepend: '/// <reference path="',
        append: '" />'
      }))
      .pipe(gulp.dest('lib/'));
});

gulp.task('run', shell.task([
  'node lib/index.js'
]));

gulp.task('watchrun', function () {
  //gulp.watch(paths.tscripts.src, runseq('compile:typescript', 'run'));
  gulp.watch(paths.tscripts.src, runseq('run'));
});

gulp.task('buildrun', function (cb) {
  runseq('build', 'run', cb);
});

gulp.task('test', 'Runs the Jasmine test specs', ['build'], function () {
    return gulp.src('test/*.js')
        .pipe(jasmine());
});
