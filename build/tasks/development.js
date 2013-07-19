'use strict';

module.exports = function(grunt){
    // run tests, compile assets, and listen
    grunt.registerTask('dev-once', ['test', 'assets']);

    // run the web-server, watch for changes and refresh
    grunt.registerTask('dev', ['concurrent:dev']);
};