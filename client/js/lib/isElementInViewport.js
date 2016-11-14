'use strict'

function isElementInViewport (el, entirely) {
  const rect = el.getBoundingClientRect()
  const within = (
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
  if (!within) {
    return false
  }
  if (entirely !== false) {
    return rect.top >= 0 && rect.left >= 0
  }
  return rect.bottom >= 0 && rect.right >= 0
}

module.exports = isElementInViewport
