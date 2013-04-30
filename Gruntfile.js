'use strict';

var config = require('./src/config.js');

module.exports = function(grunt) {
    var opts = {
        clean: [
            './src/static/.bin',
            './src/views/.bin'
        ],
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
                        '!src/static/.bin/**/*.js',
                        '!src/static/js/vendor/**/*.js'
                    ]
                },
                options: {
                    jshintrc: '.jshintrc-browser'
                }
            }
        },
        jasmine_node: {
            matchall: true,
            forceExit: true,
            projectRoot: './test/spec'
        },
        assetify: {
            options: require('./src/static/config/assets.js').grunt
        },
        watch: {
            tasks: ['local'],
            files: [
                'gruntfile.js',
                'src/**/*.js',
                'src/**/*.less',
                'src/**/*.jade',
                '!src/**/.bin',
                'test/**/*.js'
            ],
            options: {
                interrupt: true
            }
        }
    };

    grunt.initConfig(opts);

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-assetify');

    grunt.registerTask('server', function(){
        var done = this.async(),
            server = require('./src/server.js');

        server.execute({
            assetify: {
                configure: grunt.config('assetify:binder')
            }
        }, done);
    });

    grunt.registerTask('test', ['clean', 'jshint', 'jasmine_node']); // cleanup and run tests

    grunt.registerTask('default', ['test']); // by default just run the tests
    grunt.registerTask('travis', ['test', 'assetify']); // just run tests and compile assets on travis-ci

    grunt.registerTask('local', ['test', 'assetify', 'server']); // run tests, compile, and listen
    grunt.registerTask('web', ['clean', 'assetify', 'server']); // cleanup, compile, and listen

    grunt.registerTask('dev', ['watch', 'local']); // watch for changes and refresh
    grunt.registerTask('production', ['web']); // in production we just run the server task
};