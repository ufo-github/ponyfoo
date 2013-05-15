'use strict';

var config = require('../config.js'),
    Blog = require('../model/Blog.js'),
    installed;

function verify(refresh){
    return function(done){
        if(!refresh && installed !== undefined){
            return process.nextTick(complete);
        }

        Blog.count({}, function(err, count){
            if(err){
                return complete(err);
            }
            installed = count > 0;
            complete();
        });

        function complete(err){
            done(err, installed);
        }
    };
}

module.exports = {
    isInstalled: verify(false),
    updateInstalled: verify(true)
};