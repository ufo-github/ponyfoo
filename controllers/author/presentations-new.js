'use strict'

module.exports = function (req, res, next) {
  res.viewModel = {
    model: {
      title: `New Presentation \u2014 Pony Foo`
    }
  }
  next()
}
