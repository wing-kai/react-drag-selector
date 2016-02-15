"use strict";

const gulp = require('gulp');
const browserify = require('browserify');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const notify = require('gulp-notify');
const rename = require('gulp-rename');

const onError = function (err) {
    notify.onError({
        title: "Error",
        message: err.message.replace(/.+\/(.+\.(jsx|js).+)/g, '$1'),
        // message: err.message,
        sound: "Beep"
    })(err);
};

gulp.task('script', function () {
    gulp.src(['./lib/**/*.js', './lib/**/*.jsx']).pipe(plumber({
        errorHandler: onError
    })).pipe(babel({
        compact: false,
        "presets": ["es2015", "react"]
    })).pipe(plumber({
        errorHandler: onError
    })).pipe(rename({
        extname: '.js'
    })).pipe(gulp.dest('asset'));
});

gulp.task('watch', function () {
    gulp.watch(['./lib/**/*.js', './lib/**/*.jsx'], ['script']);
});

gulp.task('default', ['script', 'watch']);