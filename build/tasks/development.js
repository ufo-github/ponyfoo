'use strict';

module.exports = function(grunt){
    // cleanup and run tests
    grunt.registerTask('test', ['clean', /*'recess',*/ 'jshint', 'jasmine_node']);

    // the default is an alias of the test task
    grunt.registerTask('default', ['test']);

    // run tests, compile assets, and listen
    grunt.registerTask('dev-once', ['test', 'assets', 'web-server']);

    // run the web-server, watch for changes and refresh
    grunt.registerTask('dev', ['concurrent:dev']);
};