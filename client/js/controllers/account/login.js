'use strict'

const $ = require(`dominus`)

module.exports = function (viewModel, container) {
  const registerCheck = $(`.al-register`, container)
  const submitText = $(`.al-submit`, container)

  registerCheck.on(`change`, registerChanged)
  registerChanged()

  function registerChanged () {
    const create = registerCheck.value()
    if (create) {
      submitText.text(`Create`)
    } else {
      submitText.text(`Login`)
    }
  }
}
