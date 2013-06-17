'use strict';

var config = require('../../src/config'),
    disqus = !!config.docs.disqus.id ? {
        shortName: config.docs.disqus.id,
        url: config.server.authorityDocs,
        dev: config.env.development
    } : null;

module.exports = {
    options: {
        dest: 'src/hosts/docs/.bin',
        startPage: '/getting-started',
        title: config.docs.title,
        analytics: {
            account: config.tracking.analytics,
            domainName: config.server.tld
        },
        discussions: disqus,
        improve: {
            repo: config.meta.repo
        }
    },
    "getting-started": {
        title: 'Getting Started',
        src: ['src/docs/getting-started/**/*.ngdoc']
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