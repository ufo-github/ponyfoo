'use strict'

function sanitizeTitleHtml (html) {
  const rparagraphclose = /<\/p>/ig
  const rcollapsible = /<p>|<\/p>|(<br>$)/ig
  const result = html
    .replace(rparagraphclose, `<br>`)
    .replace(rcollapsible, ``)
  return result
}

module.exports = {
  sanitizeTitleHtml
}
