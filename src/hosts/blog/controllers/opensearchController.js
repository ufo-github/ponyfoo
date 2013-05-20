'use strict';

var path = require('path'),
    xmln = path.resolve(__dirname, '../meta/opensearch.xmln'),
    config = require('../../../config'),
    opensearchService = require('../../../service/opensearchService.js'),
    opensearch = opensearchService.configure(xmln);

module.exports = {
    getOpensearch: function(req, res, next){
        var ctx = {
                authority: config.server2.authority(req.slug),
                blog: {
                    title: req.blog.title,
                    legend: req.blog.legend || 'Find blog posts'
                }
            };

        opensearch.serve(res, ctx, next);
    }
};