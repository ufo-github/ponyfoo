'use strict';

module.exports = {
    node: {
        files: {
            src: [
                './Gruntfile.js',
                './src/**/*.js',
                '!./src/frontend/**/*.js',
                '!./src/hosts/**/static/**/*.js',
                './test/spec/**/*.js'
            ]
        },
        options: {
            jshintrc: './.jshintrc'
        }
    },
    browser: {
        files: {
            src: [
                './src/frontend/**/*.js',
                '!./src/frontend/js/vendor/**/*.js',
                './src/hosts/**/static/**/*.js',
                '!./src/hosts/**/static/.bin/**/*.js',
                '!./src/hosts/**/static/js/vendor/**/*.js'
            ]
        },
        options: {
            jshintrc: './.jshintrc-browser'
        }
    }
};