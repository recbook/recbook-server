import babel from 'gulp-babel';
import envFile from 'node-env-file';
import gulp from 'gulp';
import nodemon from 'gulp-nodemon';
import rimraf from 'rimraf';
import sourcemaps from 'gulp-sourcemaps';

const SOURCE = {
  ALL: 'src/**/*.js',
  DIST: 'dist',
};

gulp.task('updateSchema', ['build'], () => {
  return nodemon({
    script: './dist/server/updateSchema.js',
    watch: ['src/**/*.js'],
    tasks: ['build'],
  });
});

gulp.task('server', ['build'], () => {
  envFile('./env.dev.list');
  return nodemon({
    script: './dist/server/app.js',
    watch: ['src/**/*.js'],
    tasks: ['build'],
    env: { NODE_ENV: 'development' },
  });
});

gulp.task('clean', () => rimraf.sync(SOURCE.DIST));

gulp.task('build', ['clean'], () => {
  return gulp.src(SOURCE.ALL)
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});
