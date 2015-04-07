'use strict';

var path = require('path');
var contra = require('contra');
var ponymark = require('ponymark');
var imageService = require('../../../services/image');
var env = require('../../../lib/env');
var dir = path.resolve('./tmp/images');

module.exports = function (req, res) {
  var image = req.files && req.files.image;
  if (!image) {
    errored('Image upload failed!'); return;
  }

  contra.waterfall([optimize, upload], uploaded);

  function optimize (next) {
    imageService.optimizeUpload(image, next);
  }

  function upload (buffer, next) {
    var options = {
      production: env('NODE_ENV') === 'production',
      imgur: env('IMGUR_API_KEY'),
      local: dir,
      image: image
    };

    ponymark.imageUpload(options, next);
  }

  function uploaded (err, result) {
    if (err) {
      errored(err.message); return;
    }
    respond(200, result);
  }

  function errored (message) {
    respond(400, { messages: [message] });
  }

  function respond (status, message) {
    res.status(status).json(message);
  }
};
