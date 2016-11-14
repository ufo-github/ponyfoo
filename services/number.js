'use strict'

function toMoney (value) {
  const fixed = value.toFixed(2)
  const parts = fixed.split(`.`)
  let integer = parts[0]
  let result = `.` + parts[1]
  while (integer.length > 3) {
    result = `,` + integer.substr(-3) + result
    integer = integer.substr(0, integer.length - 3)
  }
  return `$` + integer + result
}

module.exports = {
  toMoney: toMoney
}
