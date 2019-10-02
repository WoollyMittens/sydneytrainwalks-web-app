// dependencies

var gulp = require('gulp');
var del = require('del');
var connect = require('gulp-connect');
var connectphp = require('gulp-connect-php');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var special = require('gulp-special-html');
var clean = require('gulp-clean');

// server

function task_connect(cb) {
	connect.server({
		port: 8080,
		root: '.',
		livereload: {
			port: 35939
		}
	});
	cb();
}

function task_connectphp(cb) {
	connectphp.server({
		port: 8080,
		base: '.'
	});
	cb();
}

// dynamic reload

function task_connect_html(cb) {
  gulp.src(['inc/**/*.html', 'inc/**/*.php'])
    .pipe(connect.reload());
	cb();
}

function task_connect_css(cb) {
  gulp.src('inc/**/*.css')
    .pipe(connect.reload());
	cb();
}

function task_connect_js(cb) {
  gulp.src('inc/**/*.js')
    .pipe(connect.reload());
	cb();
}

// pre-process

function task_styles_dev(cb) {
	gulp.src('src/scss/*.scss')
  	.pipe(sourcemaps.init())
		.pipe(sass())
		.on('error', sass.logError)
		.pipe(autoprefixer())
  	.pipe(sourcemaps.write())
		.pipe(gulp.dest('inc/css/'));
	cb();
}

function task_styles_dist(cb) {
	gulp.src('src/scss/*.scss')
		.pipe(sass({
			outputStyle: 'compressed'
		}))
		.pipe(autoprefixer())
		.pipe(gulp.dest('inc/css/'));
	cb();
}

function task_scripts_dev(cb) {
	gulp.src(['src/js/sydneytrainwalks.js', 'src/js/*.js', 'src/lib/*.js'])
		.pipe(concat('scripts.js'))
		.pipe(gulp.dest('inc/js/'));
	cb();
}

function task_scripts_dist(cb) {
	gulp.src(['src/js/sydneytrainwalks.js', 'src/js/*.js', 'src/lib/*.js'])
		.pipe(concat('scripts.js'))
		.pipe(uglify())
		.pipe(gulp.dest('inc/js/'));
	cb();
}

// watch changes

function task_default(cb) {
	gulp.watch(['src/scss/**/*.scss'], task_styles_dev);
	gulp.watch(['src/js/**/*.js', 'src/lib/**/*.js'], task_scripts_dev);
	gulp.watch(['*.html', '*.php'], task_connect_html);
  gulp.watch(['src/css/**/*.css'], task_connect_css);
  gulp.watch(['src/js/**/*.js'], task_connect_js);
	cb();
}

// tasks

exports.dist = gulp.series(
	task_styles_dist,
	task_scripts_dist
);
exports.dev = gulp.series(
	task_styles_dev,
	task_scripts_dev
);
exports.php = gulp.series(
	task_default,
	task_connectphp
);
exports.serve = gulp.series(
	task_default,
	task_connect
);
exports.watch = gulp.series(
	task_default
);
exports.default = task_default;

// errors

function errorHandler(error) {
	console.log(error.toString());
	this.emit('end');
}
