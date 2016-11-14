'use strict'

const gemoji = require(`gemoji`)
const emoji = require(`./emoji`)

function compileText (input) {
  const remoji = /:([a-z_-]+):/ig
  return input.replace(remoji, emojifyInput)
  function emojifyInput (all, name) {
    const data = gemoji.name[name]
    if (data) {
      return data.emoji
    }
    return all
  }
}

function compile (text) {
  return compileText(emoji.compile(text))
}

module.exports = {
  compile
}
