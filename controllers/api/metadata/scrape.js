'use strict';

var extract = require('meta-extractor');

module.exports = function (req, res, next) {
  var url = req.query.url;

  extract({ uri: url }, extracted);

  function extracted (err, data) {
    if (err) {
      next(err); return;
    }
    res.json({
      title: left(data.ogTitle || data.twitterTitle || data.title),
      description: data.ogDescription || data.twitterDescription || data.description || null,
      twitter: data.twitterCreator || data.twitterSite || null,
      source: data.ogSiteName || data.host,
      images: Array.from(data.images).slice(0, 6)
    });
  }
};

function left (text) {
  return text ? text.split(/\s+[|:·—–-]\s+/)[0] : null;
}
