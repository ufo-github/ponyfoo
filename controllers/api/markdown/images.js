'use strict';

var correcthorse = require('correcthorse');
var winston = require('winston');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var tmp = require('tmp');
var taunus = require('taunus');
var contra = require('contra');
var imageService = require('../../../services/image');
var env = require('../../../lib/env');
var localPath = path.resolve('./tmp/images');
var imgur = require('imgur');
var imgurClientId = env('IMGUR_CLIENT_ID');
var production = process.env.NODE_ENV === 'production';

function images (req, res) {
  var image = req.files && req.files.woofmark_upload;
  if (!image) {
    errored('Image upload failed!', new Error('Image upload failed!')); return;
  }

  contra.waterfall([optimize, upload], uploaded);

  function optimize (next) {
    imageService.optimize({
      file: image.path,
      name: image.originalname,
      size: image.size
    }, next);
  }

  function upload (next) {
    imageUpload(image, next);
  }

  function uploaded (err, result) {
    if (err) {
      errored(err.message, err); return;
    }
    var href = result.url && result.url.indexOf('http://i.imgur.com/') === 0 ?
      'https' + result.url.slice(4) :
                result.url;
    winston.info('Image uploaded to', href);
    respond(200, {
      href: href,
      title: result.alt,
      version: taunus.state.version
    });
  }

  function errored (message, err) {
    winston.warn('Error uploading an image', err);
    respond(400, {
      messages: [message],
      version: taunus.state.version
    });
  }

  function respond (status, message) {
    res.status(status).json(message);
  }
}

function toLocalUrl (local, file) {
  return file.replace(local, '/img/uploads');
}

function imageUpload (source, done) {
  if (!source) {
    done(new Error('No image source received on the back-end'));
  } else if (imgurClientId) {
    imgurUpload(source, done);
  } else if (!production) {
    fileUpload(source, done);
  } else {
    done(new Error('Misconfigured image upload!'));
  }
}

function imgurUpload (source, done) {
  imgur.setClientId(imgurClientId);
  imgur
    .uploadFile(source.path)
    .then(function (res) {
      done(null, {
        alt: source.originalname,
        url: res.data.link.replace(/^http:/, 'https:')
      });
    })
    .catch(done);
}

function fileUpload (source, done) {
  contra.waterfall([
    function (next) {
      mkdirp(localPath);
    },
    function (next) {
      var template = path.join(localPath, correcthorse() + '-X.' + source.extension);
      tmp.tmpName({ template: template }, next);
    },
    function (temp, next) {
      fs.rename(source.path, temp, function (err) {
        next(err, temp);
      });
    }
  ], function (err, temp) {
    if (err) {
      done(err); return;
    }
    done(null, {
      alt: source.originalname,
      url: toLocalUrl(localPath, temp)
    });
  });
}

module.exports = images;
