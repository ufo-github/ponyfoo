'use strict'

const mongoose = require(`mongoose`)
const cryptoService = require(`../services/crypto`)
const schema = new mongoose.Schema({
  created: { type: Date, require: true, 'default': Date.now },
  email: { type: String, require: true },
  password: { type: String, require: true }
}, { id: false })

schema.pre(`save`, beforeSave)

function beforeSave (done) {
  const user = this

  if (!user.isModified(`password`)) {
    done(); return
  }
  encryptPassword(user, done)
}

function encryptPassword (user, done) {
  cryptoService.encrypt(user.password, function encrypted (err, hash) {
    if (err) {
      done(err); return
    }
    user.password = hash
    done()
  })
}


module.exports = mongoose.model(`UnverifiedUser`, schema)
