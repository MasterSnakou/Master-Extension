var gulp = require('gulp');
var runSequence = require('run-sequence');
var fs = require('fs');
var zip = require('gulp-zip');
var del = require('del');

/*
    CHROME
*/


gulp.task('clean:chrome', function(){
	return del(['build/chrome']);
});

gulp.task('copy:chrome', function(){
	return gulp
		.src([
			'src/chrome/**'
		])
		.pipe(gulp.dest('build/chrome'));
});

gulp.task('build:chrome', function(){
	return gulp
		.src([
			'src/common/**'
		])
		.pipe(gulp.dest('build/chrome'));
});

gulp.task('compress:chrome', function(){
	var version = JSON.parse(fs.readFileSync("package.json")).version;
	return gulp.src('build/chrome/**')
		.pipe(zip('master-extension-chrome-' + version + '.zip'))
		.pipe(gulp.dest('dist/'));
});

gulp.task('package:chrome', function(){
	runSequence(
		'clean:chrome',
		'build:chrome',
		'copy:chrome',
		'compress:chrome'
	);
});

/*
    FIREFOX
*/

gulp.task('clean:firefox', function(){
	return del(['build/firefox']);
});

gulp.task('copy:firefox', function(){
	return gulp
		.src([
			'src/firefox/**'
		])
		.pipe(gulp.dest('build/firefox'));
});

gulp.task('build:firefox', function(){
	return gulp
		.src([
			'src/common/**'
		])
		.pipe(gulp.dest('build/firefox'));
});

gulp.task('compress:firefox', function(){
	var version = JSON.parse(fs.readFileSync("package.json")).version;
	return gulp.src('build/firefox/**')
		.pipe(zip('master-extension-firefox-' + version + '.xpi'))
		.pipe(gulp.dest('dist/'));
});

gulp.task('package:firefox', function(){
	runSequence(
		'clean:firefox',
		'build:firefox',
		'copy:firefox',
		'compress:firefox'
	);
});


/*
    OPERA
*/

gulp.task('clean:opera', function(){
	return del(['build/opera']);
});

gulp.task('copy:opera', function(){
	return gulp
		.src([
			'src/opera/**'
		])
		.pipe(gulp.dest('build/opera'));
});

gulp.task('build:opera', function(){
	return gulp
		.src([
			'src/common/**'
		])
		.pipe(gulp.dest('build/opera'));
});

gulp.task('compress:opera', function(){
	var version = JSON.parse(fs.readFileSync("package.json")).version;
	return gulp.src('build/opera/**')
		.pipe(zip('master-extension-opera-' + version + '.zip'))
		.pipe(gulp.dest('dist/'));
});

gulp.task('package:opera', function(){
	runSequence(
		'clean:opera',
		'build:opera',
		'copy:opera',
		'compress:opera'
	);
});



gulp.task('clean:dist', function(){
	return del(['dist/**']);
});

/*
    Package all
*/
gulp.task('package:all', function(){
	runSequence(
		'clean:dist',
		['package:chrome', 'package:firefox', 'package:opera']
	);
});

/*
    WATCH
*/
gulp.task('watch', function(){
	gulp.watch('common/**', ['package:chrome', 'package:firefox', 'package:opera']);
	gulp.watch('chrome/**', ['package:chrome']);
	gulp.watch('firefox/**', ['package:firefox']);
	gulp.watch('opera/**', ['package:opera']);
});
