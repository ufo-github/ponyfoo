'use strict';

var path = require('path'),
    cwd = process.cwd();

function require_cwd(module){
    var fullpath = path.resolve(cwd, module);
    return require(fullpath);
}

module.exports = {
    clean: [
        '.bin',
        './src/**/.bin',
        '**/*.bin.js'
    ],
    recess: require('./recess.js'),
    jshint: require('./jshint.js'),
    jasmine_node: {
        matchall: true,
        forceExit: true,
        projectRoot: './test/spec'
    },
    ngdoc: require('./docs.js'),
    browserify: {
        ultramarked: {
            src: ['./src/frontend/js/vendor/ultramarked.browserify.js'],
            output: './src/frontend/js/vendor/ultramarked.bin.js'
        }
    },
    assetify: {
        install: require_cwd('./src/hosts/install/assets.js'),
        market: require_cwd('./src/hosts/market/assets.js'),
        docs: require_cwd('./src/hosts/docs/assets.js'),
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
                './docs/**/*.ngdoc',
                './src/**/*.js',
                './src/**/*.less',
                '!./src/**/.bin',
                '!./src/**/.bin.js',
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