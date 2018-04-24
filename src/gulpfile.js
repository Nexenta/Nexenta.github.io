const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const merge = require('merge-stream');
const cleanCss = require('gulp-clean-css');
const nunjucksRender = require('gulp-nunjucks-render');

const THEME_PATH = path.join('.', 'theme');
const BUILD_PATH = path.join('.', 'build');
const CONFIG_FILE = path.join('.', 'config.json');

let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_FILE, {encoding: 'utf8'}));
} catch (e) {
  throw new Error(`ERROR: no config file: ${CONFIG_FILE}: ${e}`);
}

nunjucksRender.setDefaults({
  path: [path.join(THEME_PATH, '/templates')],
  envOptions: {
    autoescape: false
  }
});

gulp.task('css', () => {
  const scssStream = gulp
    .src(path.join(THEME_PATH, '/scss/**/*.scss'))
    .pipe(sass())
    .pipe(concat('scss'))
    .pipe(browserSync.reload({stream: true}));

  const cssStream = gulp
    .src(['./node_modules/normalize.css/normalize.css', './node_modules/highlight.js/styles/default.css'])
    .pipe(concat('css'))
    .pipe(browserSync.reload({stream: true}));

  return merge(scssStream, cssStream)
    .pipe(concat('all.min.css'))
    .pipe(cleanCss())
    .pipe(gulp.dest(path.join(BUILD_PATH, '/css')))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('renderer-index', () => {
  return gulp
    .src(path.join(THEME_PATH, '/templates/pages/index.html'))
    .pipe(
      nunjucksRender({
        data: {config}
      })
    )
    .pipe(rename('index.html'))
    .pipe(gulp.dest(BUILD_PATH))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['css', 'renderer-index'], function() {
  browserSync({
    server: {
      baseDir: BUILD_PATH
    }
  });

  gulp.watch(['**/*.html', '**/*.css', 'img/**/*'], {cwd: BUILD_PATH}, browserSync.reload);
  gulp.watch([THEME_PATH + '/scss/*.scss', './node_modules/normalize.css/normalize.css'], ['css']);
  gulp.watch(
    [THEME_PATH + '/**/*.html', THEME_PATH + '/**/*.xml', THEME_PATH + '/*.html'],
    ['renderer-index']
  );
});

gulp.task('default', ['css', 'renderer-index']);
