'use strict';

var env = require('./env.js');

module.exports = {
    twitter: {
        handle: env.CONTACT_TWITTER ? '@' + env.CONTACT_TWITTER : null,
        url: env.CONTACT_TWITTER ? 'https://twitter.com/' + env.CONTACT_TWITTER : null
    },
    email: {
        raw: env.CONTACT_EMAIL,
        to: env.CONTACT_EMAIL ? 'mailto:' + env.CONTACT_EMAIL : null
    },
    gittip: {
        widget: env.GITTIP_USER ? 'https://www.gittip.com/' + env.GITTIP_USER + '/widget.html' : null
    }
};