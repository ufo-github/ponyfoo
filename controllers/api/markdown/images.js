'use strict';

var winston = require('winston');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var tmp = require('tmp');
var taunus = require('taunus');
var contra = require('contra');
var imageService = require('../../../services/image');
var env = require('../../../lib/env');
var defaultLocal = path.resolve('./tmp/images');
var imgur = require('imgur-client');
var imgurClient;
var production = process.env.NODE_ENV === 'production';

function defaultLocalUrl (local, file) {
  return file.replace(local, '/img/uploads');
}

function imageUpload (options, done) {
  var o = {
    image: options.image,
    imgur: options.imgur,
    local: options.local || defaultLocal,
    localUrl: options.localUrl || defaultLocalUrl,
    production: options.production || production
  };
  if (o.imgur) {
    imgurClient = imgur(o.imgur);
  }
  if (!o.production) {
    mkdirp.sync(o.local);
  }

  if (!o.image) {
    done(new Error('No image received on the back-end'));
  } else if (imgurClient) {
    imgurUpload(o, done);
  } else if (!o.production) {
    fileUpload(o, done);
  } else {
    done(new Error('Misconfigured ponymark.imageUpload!'));
  }
}

function imgurUpload (o, done) {
  imgurClient.upload(o.image.path, function (err, data) {
    if (err) {
      done(err); return;
    }
    done(null, {
      alt: o.image.originalname,
      url: data.links.original
    });
  });
}

function fileUpload (o, done) {
  var template = path.join(o.local, 'XXXXXX' + o.image.extension);

  contra.waterfall([
    function (next) {
      tmp.tmpName({ template: template }, next);
    },
    function (temp, next) {
      fs.rename(o.image.path, temp, function (err) {
        next(err, temp);
      });
    }
  ], function (err, temp) {
    if (err) {
      done(err); return;
    }
    var url = o.localUrl(o.local, temp);
    done(null, {
      alt: o.image.originalname,
      url: url
    });
  });
}

module.exports = function (req, res) {
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
    var options = {
      imgur: env('IMGUR_API_KEY'),
      image: image
    };
    imageUpload(options, next);
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
    respond(400, { messages: [message] });
  }

  function respond (status, message) {
    res.status(status).json(message);
  }
};
