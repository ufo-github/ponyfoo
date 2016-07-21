'use strict';

var path = require('path');
var assign = require('assignment');
var layoutView = require('../.bin/views/server/layout/layout');
var getDefaultViewModel = require('../controllers/getDefaultViewModel');

function render (action, model, done) {
  var partialView = tryRequire();

  getDefaultViewModel(gotDefaultViewModel);

  function gotDefaultViewModel (err, defaults) {
    if (err) {
      done(err); return;
    }
    var partialModel = assign({}, defaults, model);
    var partial = partialView(partialModel.model);
    var layoutModel = assign({}, defaults, model, { partial: partial });
    var html = layoutView(layoutModel);
    done(null, html);
  }

  function tryRequire () {
    try {
      var compiledViewFile = path.resolve('.bin/views/shared/', action);
      return require(compiledViewFile);
    } catch (err) {
      done(err);
    }
  }
}

module.exports = {
  render: render
};
