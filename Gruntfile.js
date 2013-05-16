'use strict';

var config = require('./src/config');

module.exports = function(grunt) {
    var opts = {
        clean: [
            './src/**/.bin'
        ],
        jshint: {
            node: {
                files: {
                    src: [
                        './Gruntfile.js',
                        './src/**/*.js',
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
                        './src/hosts/**/static/**/*.js',
                        '!./src/hosts/**/static/.bin/**/*.js',
                        '!./src/hosts/**/static/js/vendor/**/*.js'
                    ]
                },
                options: {
                    jshintrc: './.jshintrc-browser'
                }
            }
        },
        jasmine_node: {
            matchall: true,
            forceExit: true,
            projectRoot: './test/spec'
        },
        assetify: {
            install: require('./src/hosts/install/assets.js'),
            market: require('./src/hosts/market/assets.js')
            // blog: require('./src/hosts/blog/assets.js')
        },
        watch: {
            tasks: ['dev-server'],
            files: [
                './.env',
                './.env.defaults',
                'Gruntfile.js',
                './src/**/*.js',
                './src/**/*.less',
                './src/**/*.jade',
                '!./src/**/.bin',
                './test/**/*.js'
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

    grunt.registerTask('server', 'Start the web server', function(){
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

    grunt.registerTask('dev-server', ['test', 'assetify', 'server']); // run tests, compile assets, and listen
    grunt.registerTask('dev', ['watch', 'dev-server']); // watch for changes and refresh

    grunt.registerTask('travis', ['test', 'assetify']); // just run tests and compile assets on travis-ci
    
    grunt.registerTask('production', ['clean', 'assetify', 'server']); // in production we cleanup, compile assets, and listen
};