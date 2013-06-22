'use strict';

var path = require('path');

module.exports = function(grunt){
    grunt.registerMultiTask('browserify', 'Bundle one or more assets through browserify', function(){
        var browserify = require('browserify'),
            modules = browserify(),
            data = this.data,
            src = grunt.file.expand(data.src || []);

        src.forEach(function(){
            modules.add(file);
        });

        grunt.file.write(data.output, modules.bundle());
    });
};