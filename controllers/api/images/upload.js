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
  res.json({
  "results": [
    {
      "href": "https://i.imgur.com/PCbRYDa.png",
      "title": "Screen Shot 2016-07-15 at 14.53.34.png"
    },
    {
      "href": "https://i.imgur.com/idDBsNb.png",
      "title": "Screen Shot 2016-07-15 at 14.53.36.png"
    }
  ],
  "version": "t8.1.2;v1.0.37"
});return;
  contra.map(req.files, toImageUpload, prepareResponse);

  function toImageUpload (image, next) {
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
        next(err); return;
      }
      winston.info('Image uploaded to', result.url);
      next(null, {
        href: result.url,
        title: result.alt
      });
    }
  }

  function prepareResponse (err, results) {
    if (err) {
      errored(err.message, err);
    } else {
      respond(200, {
        results: results,
        version: taunus.state.version
      });
    }
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
