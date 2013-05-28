'use strict';

var fs = require('fs'),
    moment = require('moment');

function trigger(grunt){
    var done = this.async(); // intentional, never ends.

    setTimeout(function(){
        var when = moment().format('YYYY/MM/DD HH:mm:ss'),
            status = when + ' > triggered build\n';

        fs.appendFile('.buildwatch', status, function(err){
            if(err){
                return done(err);
            }
            console.log('updated .buildwatch');
        })
    }, 2000);
}

module.exports = function(grunt){
    // task to trigger the first 'watch' event
    grunt.registerTask('dev-trigger', 'Trigger the watch task a split second later', trigger);
}