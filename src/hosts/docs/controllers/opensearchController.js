'use strict';

var path = require('path'),
    xmln = path.resolve(__dirname, '../meta/opensearch.xmln'),
    config = require('../../../config'),
    opensearchService = require('../../../service/opensearchService.js'),
    opensearch = opensearchService.configure(xmln);

module.exports = {
    getOpensearch: function(req, res, next){
        var ctx = {
                tld: config.server.tld,
                authority: config.server.authority(req.slug),
                platform: config.site.name
            };

        opensearch.serve(res, ctx, next);
    }
};