'use strict';

var env = require('./env.js'),
    server = require('./server.js');

module.exports = {
    on: env.ENABLE_MARKET && server.slug.enabled
};