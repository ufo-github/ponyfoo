'use strict'

require(`../preconfigure`)
require(`../chdir`)

const mongoUri = require(`mongodb-uri`)
const env = require(`../lib/env`)
const uri = env(`MONGO_URI`)
const parts = mongoUri.parse(uri)

parts.hosts.forEach(host => {
  const port = host.port ? `:${host.port}` : ``
  host.hostname = host.host + port
})

if (!parts.username) { parts.username = `` }
if (!parts.password) { parts.password = `` }

if (module.parent) {
  module.exports = parts
} else {
  print()
}

function print () {
  const json = JSON.stringify(parts, null, 2)
  console.log(json)
}
