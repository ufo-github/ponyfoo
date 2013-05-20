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
                platform: config.site.name
            };

        opensearch.serve(res, ctx, next);
    }
};