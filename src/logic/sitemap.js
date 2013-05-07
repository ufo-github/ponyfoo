'use strict';

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
    var result = [];

    user.find({}, '_id' , function(err,documents){
        if(err){
            done(err);
            return;
        }

        documents.forEach(function(document){
            result.push({
                url: '/user/profile/' + document._id,
                changefreq: 'daily'
            });
        });

        done(err, result);
    });
}

function posts(req, done){
    var result = [{ url: '/', changefreq: 'hourly', priority: 1 }];

    entry.find({ blog: req.blog._id }, 'date slug', function(err,documents){
        if(err){
            done(err);
            return;
        }

        documents.forEach(function(document){
            result.push({
                url: document.permalink,
                changefreq: 'hourly',
                priority: 1
            });
        });

        done(err, result);
    });
}

function market(done){
    process.nextTick(function(){
        done(null, [
            { url: '/', changefreq: 'hourly', priority: 1 }
        ]);
    });
}

function setup(req,done){
    var tasks;

    if(req.blogStatus !== 'market'){
        tasks = [
            async.apply(posts, req),
            statics,
            profiles
        ];
    }else{
        tasks = [market];
    }
    async.parallel(tasks, merge(req,done));
}

function merge(req,done){
    var slug = req.slug;

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
            hostname: config.server.hostSlug(slug),
            urls: all
        });
        sitemap.toXML(function(xml) {
            meta.writeToDisk(slug, {
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
        setup: setup,
        requestFilter: function(){
            return false;
        }
    })
};