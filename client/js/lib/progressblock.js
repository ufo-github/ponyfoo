'use strict'

const blockers = []

function has ($el) {
  return blockers.indexOf($el) !== -1
}

function add ($el) {
  if (has($el)) {
    return
  }
  blockers.push($el)
  $el.addClass(`pb-block`)
}

function release ($el) {
  blockers.splice(blockers.indexOf($el), 1)
  $el.removeClass(`pb-block`)
}

function block ($el) {
  if (has($el)) {
    return true
  }
  add($el)
}

module.exports = { has, add, release, block }
