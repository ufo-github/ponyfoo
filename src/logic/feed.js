var async = require('async'),
    path = require('path'),
    fs = require('fs'),
    fse = require('fs-extra'),
    rss = require('rss'),
    config = require('../config.js'),
    controller = require('../controllers/api/1.0/entry.js'),
    model = require('../models/entry.js');

function rebuild(done){
    var opts = {
        title: config.site.title,
        description: config.site.description,
        author: config.author.name,
        site_url: config.server.authority,
        image_url: config.site.thumbnail,
        feed_url: config.feed.latest
    };

    var feed = new rss(opts);

    controller.list({ limit: config.feed.limit }, function(err, list){
        if(err){
            throw err;
        }

        list.entries.forEach(function(document){
            feed.item({
                title: document.title,
                description: document.description,
                url: document.getUrl(),
                author: config.author.name,
                date: document.date
            });
        });

        var xml = feed.xml();
        flush(xml,done);
    });
}

function flush(xml, done){
    var relative = path.relative(config.server.authority, config.feed.latest),
        physical = path.join(config.static.bin, relative),
        folder = path.dirname(physical);

    async.series([
        async.apply(fse.mkdirs,folder),
        async.apply(fse.delete,physical),
        async.apply(fs.writeFile,physical,xml)
    ],done);
}

module.exports = {
    rebuild: rebuild
};