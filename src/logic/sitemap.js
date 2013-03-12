var config = require('../config.js'),
    $ = require('../services/$.js'),
    async = require('async'),
    factory = require('sitemap'),
    user = require('../models/user.js'),
    entry = require('../models/entry.js'),
    sitemap, urls = [];

function statics(done){
    process.nextTick(function(){
        done(undefined, [
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

function posts(done){
    var posts = [];

    entry.find({}, 'date slug', function(err,documents){
        if(err){
            done(err);
            return;
        }

        documents.forEach(function(document){
            posts.push({
                url: document.permalink,
                changefreq: 'daily',
                priority: 0.7
            });
        });

        done(err,posts);
    });
}

function refresh(){
    async.parallel([
        statics,
        profiles,
        posts
    ], merge);

    function merge(err, results){
        if(err){
            $.log.err(err);
            return;
        }

        var updated = [];

        results.forEach(function(result){
            updated = updated.concat(result);
        });

        sitemap = factory.createSitemap({
            hostname: config.server.host,
            urls: updated
        });
        urls = updated;
    }
}

setInterval(refresh, config.sitemap.refresh);
refresh();

module.exports = {
    get current() { return sitemap; },
    get contents() { return urls; },
    get: function(req, res) {
        sitemap.toXML(function(xml) {
            res.header('Content-Type', 'application/xml');
            res.end(xml);
        });
    }
};