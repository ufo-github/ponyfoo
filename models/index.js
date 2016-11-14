'use strict'

const path = require(`path`)
const glob = require(`glob`)

function load (pattern, accumulator) {
  const modules = glob.sync(pattern, { cwd: __dirname })
  const index = modules.indexOf(path.basename(__filename))
  if (index !== -1) {
    modules.splice(index, 1)
  }
  return modules.map(unwrap).reduce(keys, accumulator || {})

  function keys (accumulator, model, i) {
    const name = path.basename(modules[i], `.js`)
    accumulator[name] = model
    return accumulator
  }
}

function unwrap (file) {
  return require(path.join(__dirname, file)) // eslint-disable-line global-require
}

module.exports = function api () {
  const models = load(`*.js`, api)
  load(`hooks/*.js`)
  return models
}
