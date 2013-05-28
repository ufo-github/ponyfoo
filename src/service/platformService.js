'use strict';

var config = require('../config'),
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

function hydrate(req){
    var i = req.host.lastIndexOf('.' + config.server2.tld),
        slug = req.host.substr(0, i);

    req.slug = slug;
}

module.exports = {
    isInstalled: verify(false),
    updateInstalled: verify(true),
    hydrate: hydrate
};