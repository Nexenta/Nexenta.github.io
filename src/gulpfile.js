const fs = require('fs');
const path = require('path');
const {execSync} = require('child_process');
const gulp = require('gulp');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const merge = require('merge-stream');
const cleanCss = require('gulp-clean-css');
const Remarkable = require('remarkable');
const highlightJs = require('highlight.js');
const nunjucksRender = require('gulp-nunjucks-render');

const BLOG_PATH = path.join('.', 'blog');
const DOCS_PATH = path.join('.', 'docs');
const THEME_PATH = path.join('.', 'theme');
const BUILD_PATH = path.join('.', 'build');
const CONFIG_FILE = path.join('.', 'config.json');

let config;
try {
  config = JSON.parse(fs.readFileSync(CONFIG_FILE, {encoding: 'utf8'}));
} catch (e) {
  throw new Error(`ERROR: no config file: ${CONFIG_FILE}: ${e}`);
}

function renderMermaid(str) {
  const inpitFilePath = path.join('./', 'mermaid.tmp');
  const outputFilePath = path.join('./', 'mermaid.tmp.svg');
  const configPath = path.join('mermaidConfig.json');
  fs.writeFileSync(inpitFilePath, str);
  execSync(`./node_modules/.bin/mmdc -i ${inpitFilePath} -o ${outputFilePath} -c ${configPath}`);
  const svg = fs.readFileSync(outputFilePath);
  fs.unlinkSync(inpitFilePath);
  return svg.toString();
}

function formatDate(dateString) {
  return new Date(dateString || +new Date()).toISOString().replace(/\.[0-9]+/, '');
}

function urlify(string) {
  return (string || '')
    .toLowerCase()
    .replace(/[^\w]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^(-*)|(-*)$/g, '');
}

function parseMarkdownFile(fileDirectory, fileName) {
  let filePath = path.join(fileDirectory, fileName);
  let parsedFile;
  const fileContent = fs.readFileSync(filePath, {encoding: 'utf8'});
  const fileContentArray = fileContent.split('---');
  const header = fileContentArray[1].trim();
  const text = fileContentArray[2].trim();
  if (!header) {
    console.warn(`WARNING: no config header in: ${filePath}; (required field: title)`);
    return null;
  } else {
    try {
      parsedFile = header.split('\n').reduce((acc, option) => {
        const [param, ...value] = option.split(':');
        acc[param.trim()] = value.join(':').trim();
        return acc;
      }, {});
    } catch (e) {
      console.warn(`WARNING: bad json header in: ${filePath}`);
      return null;
    }

    const requiredParams = ['title'];
    for (let i in requiredParams) {
      if (!parsedFile[requiredParams[i]]) {
        console.warn(`WARNING: no "${requiredParams[i]}" json param in: ${filePath}`);
        return null;
      }
    }
  }

  if (!text) {
    console.warn('WARNING: no text in:', fileName);
    return null;
  }

  parsedFile.text = markdown.render(text);
  parsedFile.date = fileName.replace(/^([0-9]+-[0-9]+-[0-9]+).*/, '$1');
  parsedFile.datetimeISO = parsedFile.date ? formatDate(parsedFile.date) : null;
  parsedFile.tags = (parsedFile.tags ? parsedFile.tags.replace(/[\[\]]/g, '').split(',') : []).join(', ');

  return parsedFile;
}

const markdown = new Remarkable({
  html: true,
  langPrefix: 'language-',
  linkify: true,
  typographer: true,
  xhtmlOut: true,
  highlight: (str, lang) => {
    if (lang) {
      if (lang === 'mermaid') {
        //TODO: can't install chrome on jenkins build machine
        //return renderMermaid(str);
        return `<div class="mermaid">${str}</div>`;
      } else if (highlightJs.getLanguage(lang)) {
        try {
          return highlightJs.highlight(lang, str).value;
        } catch (err) {
          //--
        }
      }
    }

    try {
      return highlightJs.highlightAuto(str).value;
    } catch (err) {
      //--
    }

    return '';
  }
});

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

gulp.task('renderer-posts', () => {
  const posts = fs
    .readdirSync(BLOG_PATH)
    .reverse()
    .map((fileName) => {
      const parsedFile = parseMarkdownFile(BLOG_PATH, fileName);

      //let parsedFile;
      //const fileContent = fs.readFileSync(path.join(BLOG_PATH, fileName), {encoding: 'utf8'});
      //const fileContentArray = fileContent.split('---');
      //const header = fileContentArray[1].trim();
      //const text = fileContentArray[2].trim();
      //if (!header) {
      //  console.warn(`WARNING: no config header in: ${fileName}; (required field: title)`);
      //  return null;
      //} else {
      //  try {
      //    parsedFile = header.split('\n').reduce((acc, option) => {
      //      const [param, ...value] = option.split(':');
      //      acc[param.trim()] = value.join(':').trim();
      //      return acc;
      //    }, {});
      //  } catch (e) {
      //    console.warn(`WARNING: bad json header in: ${fileName}`);
      //    return null;
      //  }
      //
      //  const requiredParams = ['title'];
      //  for (let i in requiredParams) {
      //    if (!parsedFile[requiredParams[i]]) {
      //      console.warn(`WARNING: no "${requiredParams[i]}" json param in: ${fileName}`);
      //      return null;
      //    }
      //  }
      //}
      //
      //if (!text) {
      //  console.warn('WARNING: no text in:', fileName);
      //  return null;
      //}
      //
      //parsedFile.date = fileName.replace(/^([0-9]+-[0-9]+-[0-9]+).*/, '$1');
      //if (parsedFile.data === fileName) {
      //  throw new Error(`ERROR: cannot parse date from filename: ${fileName}`);
      //}

      //parsedFile.text = markdown.render(text);
      //parsedFile.datetimeISO = formatDate(parsedFile.date);

      parsedFile.link = ['/blog', parsedFile.date.replace(/-/g, '/'), urlify(parsedFile.title)].join('/') + '/';
      //parsedFile.uuid = parsedFile.link
      //  .replace(/\//g, '-')
      //  .replace(/^-/, '')
      //  .replace(/-$/, '');

      //parsedFile.tags = (parsedFile.tags ? parsedFile.tags.replace(/[\[\]]/g, '').split(',') : []).join(', ');

      return parsedFile;
    })
    .filter((post) => post !== null);

  gulp
    .src(path.join(THEME_PATH, '/resources/**/*'))
    .pipe(gulp.dest(path.join(BUILD_PATH, '/resources/')))
    .pipe(browserSync.reload({stream: true}));

  posts.map((post) =>
    gulp
      .src(path.join(THEME_PATH, '/templates/pages/post.html'))
      .pipe(
        nunjucksRender({
          data: {
            title: post.title,
            config: config,
            post: post
          }
        })
      )
      .pipe(rename('index.html'))
      .pipe(gulp.dest(path.join(BUILD_PATH, post.link)))
      .pipe(browserSync.reload({stream: true}))
  );

  gulp
    .src(THEME_PATH + '/templates/pages/feed.xml')
    .pipe(
      nunjucksRender({
        data: {
          config: config,
          nowDatetimeISO: formatDate(),
          posts: posts
        }
      })
    )
    .pipe(rename('feed.xml'))
    .pipe(gulp.dest(BUILD_PATH))
    .pipe(browserSync.reload({stream: true}));

  return gulp
    .src(path.join(THEME_PATH, '/templates/pages/posts.html'))
    .pipe(
      nunjucksRender({
        data: {
          config: config,
          posts: posts
        }
      })
    )
    .pipe(rename('index.html'))
    .pipe(gulp.dest(path.join(BUILD_PATH, 'blog')))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('renderer-docs', () => {
  const docs = fs
    .readdirSync(BLOG_PATH)
    .reverse()
    .map((fileName) => {
      const parsedFile = parseMarkdownFile(BLOG_PATH, fileName);
      parsedFile.link = ['/docs/', urlify(parsedFile.title)].join('/') + '/';
      return parsedFile;
    })
    .filter((parsedFile) => parsedFile !== null);

  //gulp
  //  .src(path.join(THEME_PATH, '/resources/**/*'))
  //  .pipe(gulp.dest(path.join(BUILD_PATH, '/resources/')))
  //  .pipe(browserSync.reload({stream: true}));
  //
  //docs.map((post) =>
  //  gulp
  //    .src(path.join(THEME_PATH, '/templates/pages/post.html'))
  //    .pipe(
  //      nunjucksRender({
  //        data: {
  //          title: post.title,
  //          config: config,
  //          post: post
  //        }
  //      })
  //    )
  //    .pipe(rename('index.html'))
  //    .pipe(gulp.dest(path.join(BUILD_PATH, post.link)))
  //    .pipe(browserSync.reload({stream: true}))
  //);
  //
  //return gulp
  //  .src(path.join(THEME_PATH, '/templates/pages/posts.html'))
  //  .pipe(
  //    nunjucksRender({
  //      data: {
  //        config: config,
  //        posts: docs
  //      }
  //    })
  //  )
  //  .pipe(rename('index.html'))
  //  .pipe(gulp.dest(path.join(BUILD_PATH, 'blog')))
  //  .pipe(browserSync.reload({stream: true}));
});

gulp.task('watch', ['css', 'renderer-index', 'renderer-posts', 'renderer-docs'], function() {
  browserSync({
    server: {
      baseDir: BUILD_PATH
    }
  });

  gulp.watch(BLOG_PATH + './**/*.md', ['renderer-posts']);
  gulp.watch(DOCS_PATH + './**/*.md', ['renderer-docs']);
  gulp.watch(['**/*.html', '**/*.css', 'img/**/*'], {cwd: BUILD_PATH}, browserSync.reload);
  gulp.watch([THEME_PATH + '/scss/*.scss', './node_modules/normalize.css/normalize.css'], ['css']);
  gulp.watch(
    [THEME_PATH + '/**/*.html', THEME_PATH + '/**/*.xml', THEME_PATH + '/*.html'],
    ['renderer-index', 'renderer-posts', 'renderer-docs']
  );
});

gulp.task('default', ['css', 'renderer-index', 'renderer-posts', 'renderer-docs']);
