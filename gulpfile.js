var browserify = require('browserify'),
    bower = require('gulp-bower'),
    concat = require('gulp-concat'),
    karma = require('gulp-karma'),
    gulp = require('gulp'),
    gutil = require('gulp-util'),
    shell = require('gulp-shell'),
    jade = require('gulp-jade'),
    jshint = require('gulp-jshint'),
    stylus = require('gulp-stylus'),
    minifyHtml = require('gulp-minify-html'),
    nodemon = require('gulp-nodemon'),
    path = require('path'),
    protractor = require('gulp-protractor').protractor,
    source = require('vinyl-source-stream'),
    stringify = require('stringify'),
    watchify = require('watchify'),
    mocha = require('gulp-mocha'),
    exit = require('gulp-exit');

var paths = {
  public: 'public/**',
  jade: 'app/**/*.jade',
  styles: 'app/styles/styles.styl',
  scripts: 'app/**/*.js',
  staticFiles: [
    '!app/**/*.+(styl|css|js|jade)',
     'app/**/*.*'
  ],
  clientTests: [],
  serverTests: ['test/server/**/*.js']
};

gulp.task('jade', function() {
  gulp.src(paths.jade)
    .pipe(jade())
    .pipe(gulp.dest('./public/'));
});

gulp.task('styles', function () {
    gulp
    .src(paths.styles)
    .pipe(stylus({
        paths: [ path.join(__dirname, 'styles') ]
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('static-files',function(){
  return gulp.src(paths.staticFiles)
    .pipe(gulp.dest('public/'));
});

gulp.task('nodemon', function () {
  nodemon({ script: 'index.js', ext: 'js', ignore: ['public/**','app/**','node_modules/**'] })
    .on('restart', function () {
      console.log('>> node restart');
    });
});

gulp.task('scripts', function() {
  gulp.src(paths.scripts)
    .pipe(concat('index.js'))
    .pipe(gulp.dest('./public/js'));
});

gulp.task('browserify', function() {
  var b = browserify();
  b.add('./app/js/application.js');
  return b.bundle()
  .on('success', gutil.log.bind(gutil, 'Browserify Rebundled'))
  .on('error', gutil.log.bind(gutil, 'Browserify Error: in browserify gulp task'))
  .pipe(source('index.js'))
  .pipe(gulp.dest('./public/js'));
});

gulp.task('watch', function() {
  gulp.watch(paths.jade, ['jade']);
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.scripts, ['browserify']);
});

gulp.task('bower', function() {
  // return bower()
  //   .pipe(gulp.dest('public/lib/'));
  console.log('No bower');
});

gulp.task('test:server', ['test:client'], function() {
  return gulp.src(paths.serverTests)
  .pipe(mocha({
    reporter: 'spec',
    timeout: 50000
  }))
  .pipe(exit());
});

gulp.task('build', ['bower', 'jade', 'styles', 'browserify', 'static-files']);
gulp.task('production', ['nodemon', 'build']);
gulp.task('default', ['nodemon', 'build', 'watch']);