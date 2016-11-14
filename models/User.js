'use strict'

const mongoose = require(`mongoose`)
const cryptoService = require(`../services/crypto`)
const gravatarService = require(`../services/gravatar`)
const { ObjectId } = mongoose.Schema.Types
const schema = new mongoose.Schema({
  email: { type: String, require: true, index: { unique: true }, trim: true },
  password: { type: String, require: true },
  bypassEncryption: { type: Boolean, 'default': true },
  created: { type: Date, require: true, 'default': Date.now },
  impersonated: { type: ObjectId, default: null, ref: `User` },
  slug: String,
  displayName: String,
  facebookId: String,
  twitterId: String,
  twitterToken: String,
  twitterTokenSecret: String,
  githubId: String,
  googleId: String,
  linkedinId: String,
  bio: String,
  bioHtml: String,
  bioText: String,
  twitter: String,
  website: String,
  avatar: String,
  unlockCodes: [String],
  roles: [String] // ['owner', 'editor', 'articles', 'weeklies', 'moderator']
}, { id: false, toObject: { getters: true }, toJSON: { getters: true } })

schema.virtual(`gravatar`).get(computeGravatar)
schema.pre(`save`, beforeSave)
schema.methods.validatePassword = validatePassword

function computeGravatar () {
  return gravatarService.format(this.email)
}

function beforeSave (done) {
  const user = this
  if (user.bypassEncryption) { // password already encrypted, we shouldn't re-encrypt it
    user.bypassEncryption = false
    done(); return
  }
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

function validatePassword (input, cb) {
  cryptoService.test(this.password, input, cb)
}

module.exports = mongoose.model(`User`, schema)
