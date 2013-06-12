'use strict';

var config = require('../config'),
    Pingback = require('pingback'),
    entryService = require('./blogEntryService.js');

function hasPingback(entry, source){
    return (entry.pingbacks || []).some(function(pingback){
        return pingback.from === source;
    });
}

module.exports = {
    handle: function(blog, pingback, next){
        var source = pingback.source.href,
            target = pingback.target.pathname;

        entryService.findByPermalink(target, blog._id, function(err, entry){
            if(err || !entry){
                return next(Pingback.TARGET_DOES_NOT_EXIST); 
            }
            if(hasPingback(entry, source)){ 
                return next(Pingback.ALREADY_REGISTERED);
            }
            if(!entry.pingbacksEnabled){
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

        Pingback.scan(article, base + entry.permalink, function(err, ping){
            if(!err && !(ping.href in entry.pings)){
                entry.pings.push(ping.href);
                entry.save();
            }
        });
    }
};