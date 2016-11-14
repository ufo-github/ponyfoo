'use strict'

const url = require(`url`)
const extract = require(`super-crap`)
const rtitleseparator = /\s+([^\w]|_)\s+/
const rweb = /^https?:\/\//i

module.exports = function (req, res, next) {
  const endpoint = req.query.url
  if (rweb.test(endpoint) === false) {
    extracted(null, {}); return
  }
  extract({ uri: endpoint }, extracted)

  function extracted (err, response) {
    if (err) {
      next(err); return
    }
    const data = response || {}
    res.json({
      title: left(data.ogTitle || data.twitterTitle || data.title),
      description: data.ogDescription || data.twitterDescription || data.description || null,
      twitter: data.twitterCreator || data.twitterSite || null,
      source: data.ogSiteName || data.host,
      images: Array.from(data.images || []).slice(0, 30).map(absolute)
    })
  }

  function absolute (relative) {
    return url.resolve(endpoint, relative)
  }
}

function left (text) {
  return text ? text.split(rtitleseparator)[0] : null
}
