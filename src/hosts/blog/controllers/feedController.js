'use strict';

var config = require('../../../config'),
    metadataService = require('../../../service/metadataService.js'),
    async = require('async'),
    rss = require('rss'),
    entryController = require('./api/entryController.js');

function setup(req,done){
    var blog = req.blog,
        blogger = req.blogger,
        host = config.server.hostSlug(blog.slug),
        opts = {
            title: blog.title,
            description: blog.meta,
            author: blogger.name,
            site_url: host,
            image_url: blog.thumbnail,
            feed_url: host + config.feed.relative
        },
        feed = new rss(opts),
        listOpts = {
            limit: config.feed.limit,
            blog: req.blog._id
        };

    entryController.list(listOpts, build(feed, req, host, done));
}

function build(feed, req, host, done){
    return function(err, list){
        if(err){
            return done(err);
        }

        async.forEach(list.entries, function(entry,done){
            entryController.getPlainTextBrief(entry, function(err,brief){
                if(err){
                    return done(err);
                }

                feed.item({
                    title: entry.title,
                    description: brief,
                    url: host + entry.permalink,
                    author: req.blogger.name,
                    date: entry.date
                });
                done();
            });
        }, function(err){
            if(err){
                return done(err);
            }
            var xml = feed.xml();

            metadataService.writeToDisk(req.blog.slug, {
                config: config.feed,
                data: xml,
                done: done
            });
        });
    };
}

module.exports = {
    getFeed: metadataService.getMetadata({
        config: config.feed,
        setup: setup
    })
};