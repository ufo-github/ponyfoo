'use strict';

var config = require('../config'),
    Twitter = require('ntwitter'),
    rhyphens = /-_/g,
    rtag = /[a-z0-9]+/i;

function extractStatus(payload){
    var authority = config.server.authority(payload.blog.slug),
        permalink = authority + payload.blog.permalink,
        status = [payload.entry.title, permalink];

    payload.entry.tags.forEach(function(tag){
        tag = tag.replace(rhyphens, '');

        if(rtag.test(tag)){
            status.push('#' + tag);
        }
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