'use strict';

var config = require('../config'),
    Pingback = require('pingback'),
    entryService = require('./blogEntryService.js');

module.exports = {
    handle: function(blog, pingback, next){
        var source = pingback.source.href,
            target = pingback.target.pathname;

        entryService.findByPermalink(target, blog._id, function(err, entry){
            if(err || !entry){
                return next(Pingback.TARGET_DOES_NOT_EXIST); 
            }
            if(entry.pingbacks[source]){ 
                return next(Pingback.ALREADY_REGISTERED);
            }
            if(entry.pingbacksDisabled){
                return next(Pingback.TARGET_CANNOT_BE_USED); 
            }

            entry.pingbacks.push({
                from: source,
                title: pingback.title,
                text: pingback.excerpt
            });
            entry.save();
            next();
        });
    },
    scan: function(entry, blog){
        var base = config.server.authority(blog.slug),
            article = [
                entry.brief,
                entry.text
            ].join('\n');

        Pingback.scan(article, base + entry.permalink, function(err, pingback){
            if(!err && !(pingback.href in entry.pings)){
                entry.pings.push(pingback.href);
                entry.save();
            }
        });
    }
};