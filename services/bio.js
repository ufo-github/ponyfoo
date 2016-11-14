'use strict'

const User = require(`../models/User`)
const cache = {}

function get (email, field, done) {
  if (cache[email] && field in cache[email]) {
    done(null, cache[email][field]); return
  }
  User.findOne({ email: email }, field, found)

  function found (err, user) {
    if (err) {
      done(err); return
    }
    if (!user) {
      done(null, ``); return
    }
    updateInternal(email, field, user[field])
    done(null, user[field])
  }
}

function updateInternal (email, field, value) {
  if (!(email in cache)) {
    cache[email] = {}
  }
  cache[email][field] = value
}

function getMarkdown (email, done) {
  get(email, `bio`, done)
}

function getHtml (email, done) {
  get(email, `bioHtml`, done)
}

function update (email, md, html, text) {
  updateInternal(email, `bio`, md)
  updateInternal(email, `bioHtml`, html)
  updateInternal(email, `bioText`, text)
}

module.exports = {
  update: update,
  getMarkdown: getMarkdown,
  getHtml: getHtml
}
