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
const del = require('del');

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

gulp.task('clean', () => del([path.join(BUILD_PATH, './*')]));

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

gulp.task('renderer-static', () => {
  gulp
    .src(path.join(THEME_PATH, '/resources/**/*'))
    .pipe(gulp.dest(path.join(BUILD_PATH, '/resources/')))
    .pipe(browserSync.reload({stream: true}));

  gulp
    .src(path.join(THEME_PATH, '/templates/pages/docker-and-k8s.html'))
    .pipe(
      nunjucksRender({
        data: {config}
      })
    )
    .pipe(rename('index.html'))
    .pipe(gulp.dest(path.join(BUILD_PATH, 'docker-and-k8s')))
    .pipe(browserSync.reload({stream: true}));

  gulp
    .src(path.join(THEME_PATH, '/templates/pages/openstack.html'))
    .pipe(
      nunjucksRender({
        data: {config}
      })
    )
    .pipe(rename('index.html'))
    .pipe(gulp.dest(path.join(BUILD_PATH, 'openstack')))
    .pipe(browserSync.reload({stream: true}));

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

gulp.task('watch', ['clean', 'css', 'renderer-static'], function() {
  browserSync({
    server: {
      baseDir: BUILD_PATH
    }
  });

  gulp.watch(['**/*.html', '**/*.css', 'img/**/*'], {cwd: BUILD_PATH}, browserSync.reload);
  gulp.watch([THEME_PATH + '/scss/*.scss', './node_modules/normalize.css/normalize.css'], ['css']);
  gulp.watch(
    [THEME_PATH + '/**/*.html', THEME_PATH + '/**/*.xml', THEME_PATH + '/*.html'],
    ['renderer-static']
  );
});

gulp.task('default', ['clean', 'css', 'renderer-static']);
