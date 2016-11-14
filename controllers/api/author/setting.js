'use strict'

const settingService = require(`../../../services/setting`)

module.exports = function (req, res, next) {
  const key = req.params.key
  const value = req.body.value
  settingService.setKey(key, value, saved)
  function saved (err) {
    if (err) {
      next(err); return
    }
    res.status(200).json({
      messages: [`Updated.`]
    })
  }
}
