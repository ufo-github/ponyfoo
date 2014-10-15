'use strict';

var path = require('path');
var ponymark = require('ponymark');
var env = require('../../../lib/env');
var dir = path.resolve('./temp/images');

module.exports = function (req, res, next) {
  var image = req.files && req.files.image;
  var options = {
    production: env('NODE_ENV') === 'production',
    imgur: env('IMGUR_API_KEY'),
    local: dir,
    image: image
  };

  ponymark.imageUpload(options, uploaded);

  function uploaded (err, result) {
    if (err) {
      errored(err.message); return;
    }
    res.status(200).json(result);
  }

  function errored (message) {
    res.status(400).json({ messages: [message] });
  }
};
