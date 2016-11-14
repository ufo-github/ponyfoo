'use strict'

const glob = require(`glob`)
const path = require(`path`)
const escapeRegExp = require(`escape-regexp`)
const env = require(`../lib/env`)
const rhash = /(.*)\.[a-f0-9]{8}\.(.*)$/
const base = `.bin/public`
const pattern = base + `/{{img,css,js}/**/*,service-worker.*.js}`
const production = env(`BUILD_ENV`) === `production`
const hashmap = getHashmap()

function getHashmap () {
  if (!production) {
    return {}
  }
  return glob.sync(pattern, { nodir: true }).reduce(toMap, {})
}

function toMap (hashmap, item) {
  const normal = item.replace(new RegExp(path.sep, `g`), `/`)
  const relative = normal.replace(base, ``)
  const hashed = relative.replace(rhash, `$1.$2`)
  hashmap[hashed] = relative
  return hashmap
}

function unroll (relative) {
  return hashmap[relative] || relative
}

function unrollAll (input) {
  return Object.keys(hashmap).reduce(replacer, input)
  function replacer (input, unhashed) {
    const hashed = hashmap[unhashed]
    const regexp = new RegExp(escapeRegExp(unhashed), `g`)
    return input.replace(regexp, hashed)
  }
}

function identity (value) {
  return value
}

module.exports = {
  unroll: production ? unroll : identity,
  unrollAll: production ? unrollAll : identity
}
