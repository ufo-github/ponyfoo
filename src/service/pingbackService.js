'use strict';

var pingback = require('pingback'),
    config = require('../config'),
    entryService = require('./blogEntryService.js');

module.exports = {
    receive: pingback.middleware(function(source, target, next) {
        var self = this;

        entryService.findByPermalink(target.pathname, function(err, entry) {
            if(err || !entry){
                return next(Pingback.TARGET_DOES_NOT_EXIST); 
            }
            if(entry.pingbacks[source.href]){ 
                return next(Pingback.ALREADY_REGISTERED);
            }
            if(entry.pingbacksDisabled){
                return next(Pingback.TARGET_CANNOT_BE_USED); 
            }

            entry.pingbacks.push({
                from: source.href,
                title: self.title,
                text: self.excerpt
            });
            entry.save();
            next();
        });
    }),
    scan: function(entry, blog){
        var base = config.server.authority(blog.slug),
            text = [
                entry.brief,
                entry.text
            ].join('\n');

        pingback.scan(text, base + entry.permalink);
    }
};