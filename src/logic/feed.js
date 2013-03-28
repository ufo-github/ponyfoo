'use strict';

var meta = require('./slug-meta.js'),
    config = require('../config.js'),
    async = require('async'),
    rss = require('rss'),
    controller = require('../controllers/api/1.0/entry.js');

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

    controller.list(listOpts, build(feed, req, host, done));
}

function build(feed, req, host, done){
    return function(err, list){
        if(err){
            throw err;
        }

        async.forEach(list.entries, function(entry,done){
            controller.getPlainTextBrief(entry, function(err,brief){
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
                throw err;
            }
            var xml = feed.xml();

            meta.writeToDisk(req.blog.slug, {
                config: config.feed,
                data: xml,
                done: done
            });
        });
    };
}

module.exports = {
    get: meta.get({
        config: config.feed,
        setup: setup
    })
};