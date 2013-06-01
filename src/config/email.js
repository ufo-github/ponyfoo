'use strict';

var env = require('./env.js');

module.exports = {
    apiKey: env.MANDRILL_APIKEY,
    debug: env.MANDRILL_DEBUG_ENABLED,
    sender: env.MANDRILL_SENDER_ADDRESS,
    trap: env.MANDRILL_DEBUG_TRAP
};