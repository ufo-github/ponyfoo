'use strict';

var path = require('path'),
    cwd = process.cwd();

module.exports = function(grunt){
    grunt.registerTask('web-server', 'Start the web server', function(){
        grunt.task.requires('assetify');

        var serverPath = path.join(cwd, '/src/server.js'),
            server = require(serverPath),
            binders = grunt.config('assetify:binders');

        server.execute(binders);

        this.async(); // I don't want to die!
    });
};