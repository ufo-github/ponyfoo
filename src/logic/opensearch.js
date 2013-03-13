'use strict';

var jsn = require('jsn'),
    fs = require('fs'),
    config = require('../config.js'),
    xmln;

function getXmln(done){
    if(xmln){
        return process.nextTick(function(){
            done(xmln);
        });
    }

    fs.readFile(config.opensearch.source, function(err, data){
        if(err){
            throw err;
        }

        xmln = data.toString();
        done(xmln);
    });
}

function getOpenSearch(req,res,next){
    var blog = req.blog;
    if(!blog){
        return next();
    }

    getXmln(function(xmln){
        var ctx = {
            favicon: config.server.host + config.static.favicon,
            template: config.server.hostSlug(blog.slug) + config.opensearch.template,
            blog: blog
        };

        jsn.parse(xmln, ctx, function(err, xml){
            if(err){
                throw err;
            }

            res.header('Content-Type', 'application/xml');
            res.end(xml);
        });
    });
}

module.exports = {
    get: getOpenSearch
};