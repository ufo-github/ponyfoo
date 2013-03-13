var meta = require('./slug-meta.js'),
    config = require('../config.js'),
    $ = require('../services/$.js'),
    async = require('async'),
    factory = require('sitemap'),
    user = require('../models/user.js'),
    entry = require('../models/entry.js');

function statics(done){
    process.nextTick(function(){
        done(null, [
            { url: '/user/register', changefreq: 'monthly', priority: 0.3 },
            { url: '/user/login', changefreq: 'monthly',  priority: 0.3 }
        ]);
    });
}

function profiles(done){
    var profiles = [];

    user.find({}, '_id' , function(err,documents){
        if(err){
            done(err);
            return;
        }

        documents.forEach(function(document){
            profiles.push({
                url: '/user/profile/' + document._id,
                changefreq: 'daily'
            });
        });

        done(err,profiles);
    });
}

function posts(req, done){
    var posts = [];

    entry.find({ blog: req.blog._id }, 'date slug', function(err,documents){
        if(err){
            done(err);
            return;
        }

        documents.forEach(function(document){
            posts.push({
                url: document.permalink,
                changefreq: 'hourly',
                priority: 1
            });
        });

        done(err,posts);
    });
}

function setup(req,done){
    async.parallel([
        statics,
        profiles,
        async.apply(posts,req)
    ], merge(req,done));
}

function merge(req,done){
    var blog = req.blog;

    return function(err, results){
        if(err){
            $.log.err(err);
            return;
        }

        var all = [];

        results.forEach(function(result){
            all = all.concat(result);
        });

        var sitemap = factory.createSitemap({
            hostname: config.server.hostSlug(blog.slug),
            urls: all
        });
        sitemap.toXML(function(xml) {
            meta.writeToDisk(blog.slug, {
                config: config.sitemap,
                data: xml,
                done: done
            });
        });
    };
}

module.exports = {
    get: meta.get({
        config: config.sitemap,
        setup: setup
    })
};