'use strict';

var config = require('../src/config');

module.exports = function(grunt) {
    var opts = require('./config');

    grunt.initConfig(opts);

    require('load-npm-tasks')(grunt);

    if(config.env.development){
        grunt.loadNpmTasks('grunt-contrib-watch');
    }

    grunt.loadTasks('./build/tasks');
};
