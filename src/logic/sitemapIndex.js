var meta = require('./slug-meta.js'),
    config = require('../config.js'),
    blog = require('../models/blog.js'),
    moment = require('moment');

function getXml(blogs){
    var xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ];
    var date = moment().format();

    blogs.forEach(function(blog){
        xml.push('<sitemap><loc>');
        xml.push(config.server.hostSlug(blog.slug) + config.sitemap.relative);
        xml.push('</loc><lastmod>');
        xml.push(date);
        xml.push('</lastmod></sitemap>');
    });
    xml.push('</sitemapindex>');
    return xml.join('');
}

function setup(req,done){
    blog.find({}, function(err, blogs){
        if(err){
            throw err;
        }
        var xml = getXml(blogs);

        meta.writeToDisk(null, {
            config: config.sitemapIndex,
            data: xml,
            done: done
        });
    });

}

module.exports = {
    get: meta.get({
        config: config.sitemapIndex,
        setup: setup
    })
};