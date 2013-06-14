'use strict';

var config = require('../../src/config'),
    disqus = !!config.docs.disqus.id ? {
          shortName: config.docs.disqus.id,
          url: config.server.authorityDocs,
          dev: config.env.development
    } : null;

module.exports = {
    options: {
        dest: 'src/hosts/docs/public',
        title: config.docs.title,
        analytics: {
              account: config.tracking.analytics,
              domainName: config.server.tld
        },
        discussions: disqus
    },
    markdown: {
        title: 'Markdown',
        src: ['src/docs/markdown/**/*.ngdoc']
    },
    api: {
        title: 'API',
        src: ['src/docs/test.js']
    }
};