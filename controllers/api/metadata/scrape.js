'use strict';

var url = require('url');
var extract = require('super-crap');
var rtitleseparator = /\s+([^\w]|_)\s+/;

module.exports = function (req, res, next) {
  var endpoint = req.query.url;

  extract({ uri: endpoint }, extracted);

  function extracted (err, response) {
    if (err) {
      next(err); return;
    }
    var data = response || {};
    res.json({
      title: left(data.ogTitle || data.twitterTitle || data.title),
      description: data.ogDescription || data.twitterDescription || data.description || null,
      twitter: data.twitterCreator || data.twitterSite || null,
      source: data.ogSiteName || data.host,
      images: Array.from(data.images || []).slice(0, 6).map(absolute)
    });
  }

  function absolute (relative) {
    return url.resolve(endpoint, relative);
  }
};

function left (text) {
  return text ? text.split(rtitleseparator)[0] : null;
}
