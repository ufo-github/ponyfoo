'use strict';

const path = require('path');
const assign = require('assignment');
const layoutView = require('../.bin/views/server/layout/layout');
const getDefaultViewModel = require('../controllers/getDefaultViewModel');

function render (action, model, done) {
  const partialView = tryRequire();

  getDefaultViewModel(gotDefaultViewModel);

  function gotDefaultViewModel (err, defaults) {
    if (err) {
      done(err); return;
    }
    const partialModel = assign({}, defaults, model);
    const partial = partialView(partialModel.model);
    const layoutModel = assign({}, defaults, model, { partial: partial });
    const html = layoutView(layoutModel);
    done(null, html);
  }

  function tryRequire () {
    try {
      const compiledViewFile = path.resolve('.bin/views/shared/', action);
      return require(compiledViewFile);
    } catch (err) {
      done(err);
    }
  }
}

module.exports = {
  render: render
};
