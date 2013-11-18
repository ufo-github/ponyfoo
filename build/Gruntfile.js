'use strict';

var config = require('../src/config');

module.exports = function(grunt) {
    var opts = require('./config');

    grunt.initConfig(opts);
    grunt.loadTasks('./build/tasks');

    require('load-grunt-tasks')(grunt);
};
