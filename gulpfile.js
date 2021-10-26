const {src, dest, watch, parallel, series } = require('gulp');
const htmlMin = require('gulp-htmlmin'); 
const scss   = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const webpack = require('webpack-stream');

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/'
    }
  })
}

function buildJs() {
  return src([
    "./app/js/main.js",
  ])
  .pipe(webpack({
    mode: 'development',
    output: {
        filename: 'script.js'
    },
    watch: false,
    devtool: "source-map",
    module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [['@babel/preset-env', {
                    debug: true,
                    corejs: 3,
                    useBuiltIns: "usage"
                }]]
              }
            }
          }
        ]
      }
  }))
  .pipe(dest('app/js'))
  .pipe(browserSync.stream())
}

function buildProdJs() {
  return src("./app/js/main.js")
    .pipe(webpack({
        mode: 'production',
        output: {
            filename: 'script.js'
        },
        module: {
            rules: [
              {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: [['@babel/preset-env', {
                        corejs: 3,
                        useBuiltIns: "usage"
                    }]]
                  }
                }
              }
            ]
          }
    }))
    .pipe(dest('dist/js'));
}

function cleanDist() {
  return del('dist')
}

function images() {
  return src('app/images/**/*')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
  ]))
    .pipe(dest('dist/images'))
}

function styles() {
  return src('app/scss/style.scss') 
    .pipe(scss({outputStyle: 'compressed'})) 
    .pipe(concat('style.min.css')) 
    .pipe(autoprefixer({grid: true}))
    .pipe(dest('app/css')) 
    .pipe(browserSync.stream())
}

function html() {
  return src('dist/**/*.html')
    .pipe(htmlMin({
      collapseWhitespace: true,
      removeComments: true
    }))
    .pipe(dest('dist'))
}

function build() {
  return src([
    'app/css/style.min.css',
    'app/fonts/**/*',
    'app/**/*.html'
  ], {base: 'app'})
  .pipe(dest('dist'))
}

function watching() {
  watch(['app/scss/**/*.scss'], styles); 
  watch(['app/**/*.html']).on('change', browserSync.reload);
  watch(['app/js/**/*.js', '!app/js/script.js'], buildJs);

}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.images = images;
exports.cleanDist = cleanDist;
exports.buildJs = buildJs;
exports.buildProdJs = buildProdJs;


exports.build = series(cleanDist, images, build, buildProdJs, html);
exports.default = parallel(buildJs, styles, browsersync, watching);