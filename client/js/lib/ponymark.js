'use strict';

var ponymark = require('ponymark');
var markdownService = require('../../../services/markdown');

ponymark.configure({
  markdown: markdownService.compile,
  imageUploads: {
    url: '/api/markdown/images',
    timeout: 25000
  }
});

module.exports = ponymark;
