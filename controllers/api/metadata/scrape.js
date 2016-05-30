'use strict';

var url = require('url');
var extract = require('super-crap');

module.exports = function (req, res, next) {
  var endpoint = req.query.url;

  extract({ uri: endpoint }, extracted);

  function extracted (err, data) {
    if (err) {
      next(err); return;
    }

    res.json({
      title: left(data.ogTitle || data.twitterTitle || data.title),
      description: data.ogDescription || data.twitterDescription || data.description || null,
      twitter: data.twitterCreator || data.twitterSite || null,
      source: data.ogSiteName || data.host,
      images: Array.from(data.images).slice(0, 6).map(absolute)
    });
  }

  function absolute (relative) {
    return url.resolve(endpoint, relative);
  }
};

function left (text) {
  return text ? text.split(/\s+([^\w]|_)\s+/)[0] : null;
}
