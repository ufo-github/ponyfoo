'use strict';

var config = require('../config'),
    Twitter = require('ntwitter'),
    rtag = /[^a-z0-9]+/ig;

function extractStatus(payload){
    var authority = config.server.authority(payload.blog.slug),
        permalink = authority + payload.entry.permalink,
        status = [payload.entry.title, 'by @nzgb', permalink];

    payload.entry.tags.forEach(function(tag){
        tag = tag.replace(rtag, '');
        status.push('#' + tag);
    });

    return status.join(' ');
}

module.exports = {
    tweet: function(payload, done){
        if(!config.twitter.broadcast){
            return process.nextTick(done);
        }

        var api = new Twitter({
            consumer_key: config.twitter.consumerKey,
            consumer_secret: config.twitter.consumerSecret,
            access_token_key: config.twitter.accessTokenKey,
            access_token_secret: config.twitter.accessTokenSecret
        });
        api.updateStatus(extractStatus(payload), done);
    }
};