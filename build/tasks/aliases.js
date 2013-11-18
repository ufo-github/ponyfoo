'use strict';

module.exports = function(grunt){
    // cleanup and run tests
    grunt.registerTask('test', ['clean', /*'recess',*/ 'jshint', 'jasmine_node']);

    // the default is an alias of the test task
    grunt.registerTask('default', ['test']);

    // generate documentation and compile assetify assets
    grunt.registerTask('assets', ['ngdoc', 'browserify', 'assetify']);
};