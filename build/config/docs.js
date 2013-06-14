'use strict';

var config = require('../../src/config'),
    disqus = !!config.docs.disqus.id ? {
          shortName: config.docs.disqus.id,
          url: config.server.authorityDocs,
          dev: config.env.development
    } : null;

module.exports = {
    options: {
        dest: '.bin/docs',
        discussions: disqus
    },
    markdown: {
        title: 'Markdown',
        src: ['src/docs/markdown/**/*.ngdoc']
    }
};