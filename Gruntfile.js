'use strict';

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
        }
    };

    grunt.initConfig(opts);

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
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

    grunt.registerTask('test', ['clean', 'jshint', 'jasmine_node']);

    grunt.registerTask('default', ['test']);
    grunt.registerTask('travis', ['test', 'assetify']); // test and compile assets on travis-ci

    grunt.registerTask('full', ['test', 'assetify', 'server']);
    grunt.registerTask('web', ['clean', 'assetify', 'server']);

    grunt.registerTask('production', ['web']);
};