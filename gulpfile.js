var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps');

//define the default task and add the watch task to it
gulp.task('default', ['watch']);

gulp.task('start', function () {
  nodemon({
    script: './bin/www'
  //, ext: 'js html'
  , env: { 'NODE_ENV': 'development' }
  })
})

gulp.task('lint', function () {
  gulp.src('./**/*.js')
    .pipe(jshint())
})
 
gulp.task('develop', function () {
  nodemon({ script: './bin/www'
          //, ext: 'html js'
          , ignore: ['ignored.js']
          , tasks: ['lint'] })
    .on('restart', function () {
      console.log('restarted!')
    })
})

gulp.task('build-css', function() {
  return gulp.src('public/css/**/*.css')
    .pipe(sourcemaps.init()) // Process the original sources
      .pipe(sass())
    .pipe(sourcemaps.write()) // Add the map to modified source.
    .pipe(gulp.dest('public/css/stylesheets'));
});

//configure which files to watch and what tasks to use on file changes
gulp.task('watch', function() {
  gulp.watch('./**/*.js', ['jshint']);
  gulp.watch('public/css/**/*.css', ['build-css']);
});