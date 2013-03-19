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
            files: [
                'gruntfile.js',
                'src/**/*.js', '!src/static/**',
                'test/spec/**/*.js'
            ],
            options: {
                jshintrc: '.jshintrc'
            }
        }
    };

    var jshint2 = {
        files: [
            'src/static/**/*.js',
            '!src/static/bin',
            '!src/static/js/libs/*.js'
        ],
        options: {
            jshintrc: '.jshintrc-browser'
        }
    };

    grunt.initConfig(opts);

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jasmine-node');

    grunt.registerTask('default', ['jshint', 'jasmine_node']);
    grunt.registerTask('travis', ['jshint', 'jasmine_node']);
};