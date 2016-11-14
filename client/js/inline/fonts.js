'use strict'

const fontfaceonload = require(`fontfaceonload`)
const contentLoaded = require(`./vendor/contentLoaded`)
const persistance = `localStorage` in window
const checks = {}

// load fonts from google asynchronously
const elem = document.createElement(`link`)
const head = document.getElementsByTagName(`head`)[0]
elem.rel = `stylesheet`
elem.href = `https://fonts.googleapis.com/css?family=Neuton:700|Merriweather:400italic,400,700`
elem.media = `only x`
head.appendChild(elem)
setTimeout(function () {
  elem.media = `all`
})

checkAllFonts() // cache may be primed, try to swap early!
setTimeout(checkAllFonts, 0) // fixes issues when opening a new tab with ctrl+enter in chrome
contentLoaded(window, checkAllFonts) // cache isn't primed, wait on async <link> with custom fonts
contentLoaded(window, checkAllFonts, true) // always runs on onload event

function checkAllFonts () {
  checkFont(`Merriweather`, `ly-custom-subheading`)
  checkFont(`Neuton`, `ly-custom-heading`)
}

function checkFont (name, className) {
  if (!(className in checks)) {
    checks[className] = fontLoaded(className)
  } else if (checks[className].once) {
    return
  }
  if (persistance && localStorage[`fonts:` + className]) {
    checks[className](); return // user probably has the font in their cache
  }
  fontfaceonload(name, { success: checks[className], weight: 700 })
}

function fontLoaded (className) {
  return function loaded () {
    if (loaded.once) {
      return
    }
    loaded.once = true
    const doc = document.documentElement
    const separator = doc.className.length ? ` ` : ``
    doc.className += separator + className
    if (persistance) {
      localStorage[`fonts:` + className] = true
    }
  }
}
