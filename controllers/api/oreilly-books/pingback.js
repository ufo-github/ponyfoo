'use strict'

const winston = require(`winston`)
const atlasBuildService = require(`../../../services/atlasBuild`)

function pingback (req, res) {
  const bookSlug = req.params.slug
  res.end()
  atlasBuildService.download({ bookSlug }, downloaded)

  function downloaded (err) {
    if (err) {
      winston.warn(`Error while downloading build after pingback from O'Reilly Atlas.`, err)
    } else {
      winston.warn(`Downloaded build after pingback from O'Reilly Atlas.`)
    }
  }
}

module.exports = pingback
