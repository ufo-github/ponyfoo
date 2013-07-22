'use strict';

var config = require('../src/config');

module.exports = function(grunt) {
    var opts = require('./config');

    grunt.initConfig(opts);

    grunt.loadNpmTasks('grunt-assetify');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-recess');
    grunt.loadNpmTasks('grunt-ngdoc');

    if(config.env.development){
        grunt.loadNpmTasks('grunt-contrib-watch');
    }

    grunt.loadTasks('./build/tasks');
};