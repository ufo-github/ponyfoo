'use strict';

var Pingback = require('pingback'),
    pingbackService = require('../../../service/pingbackService.js');

module.exports = {
    receive: function (req, res, next) {
        console.log('Pingback unsupported at the moment.');
        next();
    }
};
/*
module.exports = {
    receive: Pingback.middleware(function(source, target, next){
        pingbackService.handle(this.req.blog, this, next);
    })
};
*/