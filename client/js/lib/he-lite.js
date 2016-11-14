'use strict'

const escapes = {
  '&': `&amp;`,
  '<': `&lt;`,
  '>': `&gt;`,
  '"': `&quot;`,
  '\'': `&#39;`
}
const unescapes = {
  '&amp;': `&`,
  '&lt;': `<`,
  '&gt;': `>`,
  '&quot;': `"`,
  '&#39;': `'`
}
const rescaped = /(&amp;|&lt;|&gt;|&quot;|&#39;)/g
const runescaped = /[&<>"']/g

function escapeHtmlChar (match) {
  return escapes[match]
}
function unescapeHtmlChar (match) {
  return unescapes[match]
}

function escapeHtml (text) {
  return !text ? `` : String(text).replace(runescaped, escapeHtmlChar)
}

function unescapeHtml (html) {
  return !html ? `` : String(html).replace(rescaped, unescapeHtmlChar)
}

escapeHtml.options = unescapeHtml.options = {}

module.exports = {
  encode: escapeHtml,
  escape: escapeHtml,
  decode: unescapeHtml,
  unescape: unescapeHtml,
  version: `1.0.0-browser`
}
