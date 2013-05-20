'use strict';

var metadataService = require('../../../service/metadataService.js'),
    config = require('../../../config'),
    Blog = require('../../../model/Blog.js'),
    moment = require('moment');

function getXml(blogs){
    var xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ];
    var date = moment().format();

    if(config.server.slugged){
        blogs.unshift({ slug: config.server.slugMarket });
    }
    
    blogs.forEach(function(blog){
        xml.push('<sitemap><loc>');
        xml.push(config.server2.authority(blog.slug) + config.sitemap.relative);
        xml.push('</loc><lastmod>');
        xml.push(date);
        xml.push('</lastmod></sitemap>');
    });
    xml.push('</sitemapindex>');
    return xml.join('');
}

function setup(req,done){
    Blog.find({}, function(err, blogs){
        if(err){
            return done(err);
        }
        var xml = getXml(blogs);

        metadataService.writeToDisk(null, {
            config: config.sitemapIndex,
            data: xml,
            done: done
        });
    });
}

module.exports = {
    getSitemapIndex: metadataService.getMetadata({
        config: config.sitemapIndex,
        setup: setup
    })
};