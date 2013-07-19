'use strict';

module.exports = function(grunt){
    // on travis-ci, just run tests and compile assets
    grunt.registerTask('travis', ['test', 'assets']);
    
    // in production we cleanup, compile assets, and listen
    grunt.registerTask('production', ['clean', 'assets']);
};