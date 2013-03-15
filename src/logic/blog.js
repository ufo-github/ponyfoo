'use strict';

var config = require('../config.js'),
    blog = require('../models/blog.js'),
    live;

function getStatus(done){
    if(live !== undefined){
        return process.nextTick(done);
    }

    blog.count({}, function(err, count){
        live = count > 0;
        done();
    });
}

function getSlug(req){
    var i = req.host.lastIndexOf('.' + config.server.tld),
        slug = req.host.substr(0, i);

    return slug;
}

module.exports = {
    get live(){ return live; },
    set live(value) { live = !!value; },
    get dormant(){ return !this.live; },
    getSlug: getSlug,
    getStatus: getStatus
};