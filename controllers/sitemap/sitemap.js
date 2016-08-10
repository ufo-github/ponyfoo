'use strict';

var sitemapService = require('../../services/sitemap');

module.exports = function (req, res) {
  if (sitemapService.built) {
    send();
  } else {
    sitemapService.once('built', send);
  }
  function send () {
    res.sendFile(sitemapService.location);
  }
};
