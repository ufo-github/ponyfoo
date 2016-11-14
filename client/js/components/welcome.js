'use strict'

function welcome (version) {
  const message = [
    `%c████████████████████████████████████████████%c████%c████`,
    `%c████████████████████████████████████████████%c████%c████`,
    `%c████████████████████████████████████████%c████%c████`,
    `%c████████████████████████████████████████%c████%c████`,
    `%c████████████%c████%c████%c████%c████%c████%c████%c████%c████`,
    `%c████████████%c████%c████%c████%c████%c████%c████%c████%c████`,
    `%c████████%c████%c████████████████████████████`,
    `%c████████%c████%c████████████████████████████`,
    `%c████%c████%c████%c████████████████████████████`,
    `%c████%c████%c████%c████████████████████████████`,
    `%c████%c████%c████████████████%c████%c████%c████████%c████`,
    `%c████%c████%c████████████████%c████%c████%c████████%c████`,
    `%c████████████████████████%c████████%c████████`,
    `████████████████████████%c████████%c████████`,
    `████████████████████████████████████████`,
    `████████████████████████████████████████`,
    `████████████████████████████████████████%c████%c`,
    `████████████████████████████████████████%c████%c`,
    `████████████████████████████████████████████`,
    `████████████████████████████████████████████`,
    `████████████████████████████████████████████`,
    `████████████████████████%c████%c████%c████████████`,
    `████████████████████████%c████%c████%c████████████`,
    `████████████████████████████%c████%c`,
    `████████████████████████████%c████%c`,
    `████████████████████████████████%c████%c`,
    `████████████████████████████████%c████`,
    ``,
    `%cWelcome, adventurer! Pony Foo is running on version %s.`,
    `Feel free to play around with our globals: $, md, and moment!`
  ].join(`\n`)

  const logoFont = `font-family: Arial; font-size: 11px;`
  const green = `color: #26ef00; ` + logoFont
  const greenIris = `color: #26e400; ` + logoFont
  const oneas = `color: #1a1a1a; ` + logoFont
  const threes = `color: #333333; ` + logoFont
  const fourds = `color: #4d4d4d; ` + logoFont
  const black = `color: #000000; ` + logoFont
  const transparent = `color: transparent; ` + logoFont
  const css = `color: #e92c6c; font-size: 1.4em; font-family: "Neuton" "Helvetica Neue", HelveticaNeue, TeXGyreHeros, FreeSans, "Nimbus Sans L", "Liberation Sans", Helvetica, Arial, sans-serif;`

  console.log(
    message,

    transparent, threes, black,
    transparent, threes, black,

    transparent, fourds, black,
    transparent, fourds, black,

    transparent, threes, black, oneas, transparent, oneas, transparent, threes, black,
    transparent, threes, black, oneas, transparent, oneas, transparent, threes, black,

    transparent, threes, black,
    transparent, threes, black,

    transparent, threes, oneas, black,
    transparent, threes, oneas, black,

    threes, oneas, black, green, greenIris, black, oneas,
    threes, oneas, black, green, greenIris, black, oneas,

    black, green, black,
    green, black,

    threes, black,
    threes, black,

    threes, transparent, black,
    threes, transparent, black,

    threes, black,
    threes, black,

    threes, black,
    threes,

    css, version
  )
}

module.exports = welcome
