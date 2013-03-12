var async = require('async'),
    path = require('path'),
    fs = require('fs'),
    fse = require('fs-extra'),
    rss = require('rss'),
    config = require('../config.js'),
    controller = require('../controllers/api/1.0/entry.js'),
    model = require('../models/entry.js');

function setup(req,done){
    var blog = req.blog,
        blogger = req.blogger,
        host = config.server.hostSlug(blog.slug),
        opts = {
            title: blog.title,
            description: blog.description,
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
                    done(err);
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
            flush(req.blog.slug, xml, done);
        });
    };
}

function flush(slug, xml, done){
    var relative = config.feed.physical(slug),
        physical = path.join(config.static.bin, relative),
        folder = path.dirname(physical);

    async.series([
        async.apply(fse.mkdirs,folder),
        async.apply(fse.delete,physical),
        async.apply(fs.writeFile,physical,xml)
    ], function(err){
        if(err){
            return done(err);
        }
        done(err,xml,physical);
    });
}

function getFeedXml(req,res,next){
    var blog = req.blog;
    if(!blog){
        return next();
    }

    var relative = config.feed.physical(blog.slug),
        physical = path.join(config.static.bin, relative),
        folder = path.dirname(physical);

    fse.mkdirs(folder, function(err){
        if(err){
            throw err;
        }

        fs.exists(physical, function(exists){
            if(exists){
                fs.stat(physical,function(err, stats){
                    var now = new Date;
                    if (now - stats.mtime > config.feed.cache){
                        return rebuildFirst(req,res);
                    }else{
                        return serve(res)(null,null,physical);
                    }
                });
            }else{
                return rebuildFirst(req,res);
            }
        });
    });
}

function rebuildFirst(req,res){
    setup(req,serve(res));
}

function serve(res){
    return function(err,xml,physical){
        if(err){
            throw err;
        }

        if(xml){
            res.header('Content-Type', 'application/xml');
            res.end(xml);
        }else{
            res.sendfile(physical);
        }
    };
}

module.exports = {
    get: getFeedXml
};