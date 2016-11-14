'use strict'

const $ = require(`dominus`)

module.exports = function (viewModel) {
  const container = $(`.usr-container`)

  container.on(`click`, `.usr-remove`, remove)

  function remove (e) {
    const target = $(e.target)
    const id = target.attr(`data-id`)
    const confirmation = confirm(`About to delete /users/` + id + `, are you sure?`)
    if (!confirmation) {
      return
    }
    const endpoint = `/api/users/` + id

    viewModel.measly.delete(endpoint).on(`data`, removeRow)

    function removeRow () {
      target.parents(`tr`).remove()
    }
  }
}
