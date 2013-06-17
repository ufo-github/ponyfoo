'use strict';

var async = require('async'),
    cheerio = require('cheerio'),
    config = require('../../../config'),
    userService = require('../../../service/userService.js'),
    blogService = require('../../../service/blogService.js'),
    entryService = require('../../../service/blogEntryService.js'),
    textService = require('../../../service/textService.js'),
    markdownService = require('../../../service/markdownService.js');

function getProfile(user, done){
    if(!user){
        return process.nextTick(function(){
            done(null, 'anon');
        });
    }

    userService.hasBlog(user, function(err, hasOne){
        done(null, hasOne ? 'blogger' : 'registered');
    });
}

function htmlize(text){
    var breaks = textService.truncate(text, 400).split(/\n/ig),
        paragraphs = breaks.map(function(p){
            return '<p>' + p + '</p>';
        });

    return paragraphs.join('');
}

module.exports = {
    getIndex: function(req, res, next){
        async.waterfall([
            function(next){
                entryService.getLatest({ limit: config.market.articles }, next);
            },
            function(entries, next){
                async.map(entries, function(entry, done){
                    async.waterfall([
                        function(next){
                            blogService.findById(entry.blog, next);
                        },
                        function(blog, next){
                            var authority = config.server.authority(blog.slug),
                                html = markdownService.parse(entry.brief),
                                text = cheerio.load(html).root().text();

                            next(null, {
                                authority: authority,
                                permalink: authority + entry.permalink,
                                title: entry.title,
                                excerpt: htmlize(text),
                                tags: entry.tags
                            });
                        }
                    ], done);
                }, next);
            },
            function(entries, next){
                getProfile(req.user, function(err, profile){
                    next(err, entries, profile);
                });
            },
            function(entries, profile, next){
                res.render('home/index.jade', {
                    profile: 'all',
                    entries: entries
                });
            }
        ], function(err){
            if(err){
                next(err);
            }
        });
    }
};