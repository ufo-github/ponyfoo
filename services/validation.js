'use strict'

const validator = require(`validator`)

function integer (value, defaultValue) {
  const casted = validator.toInt(value || defaultValue)
  return !isNaN(casted) && casted || defaultValue
}

module.exports = {
  integer: integer
}
