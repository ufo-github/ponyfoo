'use strict';

var path = require('path');

module.exports = function(grunt){
    grunt.registerMultiTask('browserify', 'Bundle assets through browserify', function(){
        var done = this.async(),
            browserify = require('browserify'),
            modules = browserify(),
            data = this.data,
            src = grunt.file.expand(data.src || []),
            bundle;

        src.forEach(function(file){
            modules.add(file);
        });

        modules.bundle(function(err, assets){
            grunt.file.write(data.output, assets);
            done();
        });
    });
};