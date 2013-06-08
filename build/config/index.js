'use strict';

var path = require('path'),
    cwd = process.cwd();

function require_cwd(module){
    var fullpath = path.resolve(cwd, module);
    return require(fullpath);
}

module.exports = {
    clean: [
        './src/**/.bin'
    ],
    recess: {
        install: {
            src: ['./src/hosts/install/**/*.less'],
            options: { strictPropertyOrder: false }
        },
        market: {
            src: ['./src/hosts/market/**/*.less'],
            options: { strictPropertyOrder: false }
        },
        blog: {
            src: ['./src/hosts/blog/**/*.less'],
            options: { strictPropertyOrder: false }
        }
    },
    jshint: {
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
    },
    jasmine_node: {
        matchall: true,
        forceExit: true,
        projectRoot: './test/spec'
    },
    assetify: {
        install: require_cwd('./src/hosts/install/assets.js'),
        market: require_cwd('./src/hosts/market/assets.js'),
        blog: require_cwd('./src/hosts/blog/assets.js')
    },
    watch: {
        dev: {
            tasks: ['dev-once'],
            files: [
                './.buildwatch',
                './.env',
                './.env.defaults',
                'Gruntfile.js',
                './build/**/*.js',
                './src/**/*.js',
                './src/**/*.less',
                '!./src/**/.bin',
                './test/**/*.js'
            ],
            options: {
                interrupt: true
            }   
        }
    },
    concurrent: {
        dev: {
            tasks: ['watch:dev', 'dev-trigger'],
            options: {
                logConcurrentOutput: true
            }
        }
    }
};