'use strict';

module.exports = function(grunt){
    // generate documentation and compile assetify assets
    grunt.registerTask('assets', ['ngdoc', 'assetify']);
};