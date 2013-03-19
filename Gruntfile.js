'use strict';

module.exports = function(grunt) {
    var opts = {
        pkg: grunt.file.readJSON('package.json'),
        jasmine_node: {
            matchall: true,
            forceExit: true,
            projectRoot: './test/spec'
        },
        jshint: {
            node: {
                files: {
                    src: [
                        'gruntfile.js',
                        'src/**/*.js',
                        '!src/static/**/*.js',
                        'src/static/config/**/*.js',
                        'test/spec/**/*.js'
                    ]
                },
                options: {
                    jshintrc: '.jshintrc'
                }
            },
            browser: {
                files: {
                    src: [
                        'src/static/**/*.js',
                        '!src/static/config/*.js',
                        '!src/static/bin/**/*.js',
                        '!src/static/js/libs/**/*.js'
                    ]
                },
                options: {
                    jshintrc: '.jshintrc-browser'
                }
            }
        }
    };

    grunt.initConfig(opts);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jasmine-node');

    grunt.registerTask('default', ['jshint', 'jasmine_node']);
    grunt.registerTask('travis', ['jshint', 'jasmine_node']);
};