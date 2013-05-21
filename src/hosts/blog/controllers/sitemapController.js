'use strict';

var async = require('async'),
    factory = require('sitemap'),
    metadataService = require('../../../service/metadataService.js'),
    config = require('../../../config'),
    User = require('../../../model/User.js'),
    Entry = require('../../../model/Entry.js');

function statics(done){
    process.nextTick(function(){
        done(null, [
            { url: '/user/login', changefreq: 'monthly',  priority: 0.3 }
        ]);
    });
}

function profiles(done){
    var result = [];

    User.find({}, '_id' , function(err, users){
        if(err){
            done(err);
            return;
        }

        users.forEach(function(user){
            result.push({
                url: '/user/profile/' + user._id,
                changefreq: 'daily'
            });
        });

        done(err, result);
    });
}

function posts(req, done){
    var result = [{ url: '/', changefreq: 'hourly', priority: 1 }];

    Entry.find({ blog: req.blog._id }, 'date slug', function(err, entries){
        if(err){
            done(err);
            return;
        }

        entries.forEach(function(entry){
            result.push({
                url: entry.permalink,
                changefreq: 'hourly',
                priority: 1
            });
        });

        done(err, result);
    });
}

function setup(req,done){
    async.parallel([
        async.apply(posts, req),
        statics,
        profiles
    ], merge(req,done));
}

function merge(req,done){
    var slug = req.slug;

    return function(err, results){
        if(err){
            return done(err);
        }

        var all = [];

        results.forEach(function(result){
            all = all.concat(result);
        });

        var sitemap = factory.createSitemap({
            hostname: config.server2.authority(slug),
            urls: all
        });

        sitemap.toXML(function(xml) {
            metadataService.writeToDisk(slug, {
                config: config.sitemap,
                data: xml,
                done: done
            });
        });
    };
}

module.exports = {
    getSitemap: metadataService.getMetadata({
        config: config.sitemap,
        setup: setup
    })
};