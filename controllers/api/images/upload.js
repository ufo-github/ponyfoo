'use strict'

const correcthorse = require(`correcthorse`)
const winston = require(`winston`)
const path = require(`path`)
const fs = require(`fs`)
const mkdirp = require(`mkdirp`)
const tmp = require(`tmp`)
const taunus = require(`taunus`)
const contra = require(`contra`)
const imageService = require(`../../../services/image`)
const env = require(`../../../lib/env`)
const localPath = path.resolve(`./tmp/images`)
const imgur = require(`imgur`)
const imgurClientId = env(`IMGUR_CLIENT_ID`)
const production = process.env.NODE_ENV === `production`

function images (req, res) {
  contra.map(req.files, toImageUpload, prepareResponse)

  function toImageUpload (image, next) {
    contra.waterfall([optimize, upload], uploaded)

    function optimize (next) {
      imageService.optimize({
        grayscale: `grayscale` in req.query,
        preserveSize: `preserve-size` in req.query,
        file: image.path,
        name: image.originalname,
        size: image.size
      }, next)
    }

    function upload (next) {
      imageUpload(image, next)
    }

    function uploaded (err, result) {
      if (err) {
        next(err); return
      }
      winston.info(`Image uploaded to`, result.url)
      next(null, {
        href: result.url,
        title: result.alt
      })
    }
  }

  function prepareResponse (err, results) {
    if (err) {
      errored(err.message, err)
    } else {
      respond(200, {
        results: results,
        version: taunus.state.version
      })
    }
  }

  function errored (message, err) {
    winston.warn(`Error uploading an image`, err)
    respond(400, {
      messages: [message],
      version: taunus.state.version
    })
  }

  function respond (status, message) {
    res.status(status).json(message)
  }
}

function toLocalUrl (local, file) {
  return file.replace(local, `/img/uploads`)
}

function imageUpload (source, done) {
  if (!source) {
    done(new Error(`No image source received on the back-end`))
  } else if (imgurClientId) {
    imgurUpload(source, done)
  } else if (!production) {
    fileUpload(source, done)
  } else {
    done(new Error(`Misconfigured image upload!`))
  }
}

function imgurUpload (source, done) {
  imgur.setClientId(imgurClientId)
  imgur
    .uploadFile(source.path)
    .then(function (res) {
      done(null, {
        alt: source.originalname,
        url: res.data.link.replace(/^http:/, `https:`)
      })
    })
    .catch(done)
}

function fileUpload (source, done) {
  contra.waterfall([ensureLocalPath, generateFilename, renameUploadedFile], respond)

  function ensureLocalPath (next) {
    mkdirp(localPath, next)
  }

  function generateFilename (next) {
    const template = path.join(localPath, `${ correcthorse() }-X.${ source.extension }`)
    tmp.tmpName({ template: template }, next)
  }

  function renameUploadedFile (temp, next) {
    fs.rename(source.path, temp, err => next(err, temp))
  }

  function respond (err, temp) {
    if (err) {
      done(err); return
    }
    done(null, {
      alt: source.originalname,
      url: toLocalUrl(localPath, temp)
    })
  }
}

module.exports = images
