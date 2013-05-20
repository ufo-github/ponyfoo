'use strict';

var factory = require('sitemap'),
    metadataService = require('../../../service/metadataService.js'),
    config = require('../../../config');

function setup(req,done){
    var all = [{
        url: '/', changefreq: 'hourly', priority: 1
    }];

    var sitemap = factory.createSitemap({
        hostname: config.server2.authority(req.slug),
        urls: all
    });

    sitemap.toXML(function(xml) {
        metadataService.writeToDisk(req.slug, {
            config: config.sitemap,
            data: xml,
            done: done
        });
    });
}

module.exports = {
    getSitemap: metadataService.getMetadata({
        config: config.sitemap,
        setup: setup
    })
};