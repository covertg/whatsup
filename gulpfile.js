const { src, dest, series, parallel, watch } = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
// const cleancss = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const livereload = require('gulp-livereload');
const mode = require('gulp-mode')();
const nunjucksRender = require('gulp-nunjucks-render');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
sass.compiler = require('sass');
// const uglify = require('gulp-uglify');

function javascript() {
    return src(['src/js/*.js'])
        .pipe(babel({ presets: ['@babel/env'] }))
        .pipe(concat('all.js'))
        // .pipe(uglify())
        .pipe(dest('dist/intermed'));
};

function styles() {
    return src('src/scss/*.scss')
        .pipe(sass({ includePaths: ['./node_modules/vital-css/sass/'] }).on('error', sass.logError))
        // .pipe(cleancss())
        .pipe(rename('style.css'))
        .pipe(dest('dist/intermed'));
};

function html() {
    return src('src/pages/**/*.html')
        .pipe(nunjucksRender({ path: ['src/templates', 'dist'] }))
        .pipe(mode.production(htmlmin({
            minifyCSS: true,
            minifyJS: true,
            collapseWhitespace: true,
            removeComments: true })))
        .pipe(dest('dist'))
        .pipe(mode.development(livereload()));
};

exports.styles = styles;
exports.javascript = javascript;
exports.html = html;
exports.build = series(parallel(javascript, styles), html);
exports.watch = function () {
    mode.development(livereload.listen());
    watch('src/**/*', exports.build);
};
exports.default = exports.watch;