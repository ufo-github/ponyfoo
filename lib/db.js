'use strict'

const mongoose = require(`mongoose`)
const mongoUri = require(`mongodb-uri`)
const winston = require(`winston`)
const env = require(`./env`)
const uri = env(`MONGO_URI`)
const delayToReconnect = 1000
const options = require(`./dbOptions`)
const log = env(`LOG_MONGO_CONNECTION`) !== false
let dbName
let initialized = false
let disconnecting

mongoose.Promise = global.Promise

function connect (done) {
  const db = mongoose.connection
  if (initialized === false) {
    initialized = true
    logging(db)
    reconnection(db)
  }
  db.once(`connected`, done)
  open()
}

function disconnect (done) {
  const db = mongoose.connection
  if (db.readyState !== 0) {
    disconnecting = true
    db.once(`disconnected`, disconnected)
    db.close()
  }
  function disconnected () {
    disconnecting = false
    if (done) { done() }
  }
}

function open () {
  dbName = mongoUri.parse(uri).database
  if (log) {
    winston.debug(`Opening database connection to {db:%s}...`, dbName)
  }
  mongoose.connect(uri, options)
}

function logging (db) {
  db.on(`connected`, function connected () {
    if (log) {
      winston.info(`Database connection to {db:%s} established.`, dbName)
    }
  })
  db.on(`open`, function open () {
    if (log) {
      winston.debug(`Database connection to {db:%s} opened.`, dbName)
    }
  })
  db.on(`disconnected`, function disconnected () {
    if (disconnecting !== true) {
      if (log) {
        winston.error(`Database connection to {db:%s} lost.`, dbName)
      }
    }
  })
  db.on(`error`, function error (err) {
    if (log) {
      winston.error(`Database connection to {db:%s} error.`, dbName, { stack: err.stack || err.message || err || `(unknown)` })
    }
  })
}

function reconnection (db) {
  let timer

  db.on(`disconnected`, schedule)
  db.on(`connected`, clear)

  function schedule () {
    if (disconnecting) {
      if (log) {
        winston.info(`Database connection to {db:%s} explicitly shut down.`, dbName)
      }
      return
    }
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(reconnect, delayToReconnect)
  }

  function reconnect () {
    timer = false
    open(db)
  }

  function clear () {
    if (timer) {
      clearTimeout(timer)
    }
    timer = false
  }
}

module.exports = connect

connect.disconnect = disconnect
