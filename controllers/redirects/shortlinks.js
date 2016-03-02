'use strict';

var links = require('../../dat/shortlinks.json');

function setup (app) {
  app.get('/bf/:shortlink', expander);
  app.get('/s/:shortlink', expander);
}

function expander (req, res, next) {
  var path = req.path;
  if (!links.hasOwnProperty(path)) {
    next(); return;
  }
  var link = links[path];
  res.status(302).redirect(link);
}

module.exports = {
  setup: setup
};
