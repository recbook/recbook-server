import gulp from 'gulp';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import rimraf from 'rimraf';
import nodemon from 'gulp-nodemon';

const SOURCE = {
  ALL: 'app/**/*.js',
  DIST: 'dist'
};

gulp.task('server', ['build'], () => {
  return nodemon({
    script: './dist/app.js',
    watch: ['src'],
    tasks: ['build'],
    env: {'NODE_ENV': 'development'}
  });
});

gulp.task('clean', () => rimraf.sync(SOURCE.DIST));

gulp.task('build', ['clean'], () => {
  return gulp.src(SOURCE.ALL)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"))
});