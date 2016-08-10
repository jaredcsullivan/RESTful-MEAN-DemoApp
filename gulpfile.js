var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    jshint = require('gulp-jshint'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps');

gulp.task('default', ['watch']);

gulp.task('start', function () {
  nodemon({
    script: './bin/www', 
    env: { 'NODE_ENV': 'development' }, 
	ext: "js", 
	nodeArgs: ['/usr/local/bin/node-theseus']
  })
})

gulp.task('lint', function () {
  gulp.src('./**/*.js')
    .pipe(jshint())
})
 
gulp.task('develop', function () {
  nodemon({ script: './bin/www', 
		    ignore: ['ignored.js'], 
		    tasks: ['lint'] })
    .on('restart', function () {
      console.log('restarted!')
    })
})

gulp.task('build-css', function() {
  return gulp.src('public/css/**/*.css')
    .pipe(sourcemaps.init())
      .pipe(sass())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/css/stylesheets'));
});

gulp.task('watch', function() {
  gulp.watch('./**/*.js', ['jshint']);
  gulp.watch('public/css/**/*.css', ['build-css']);
});