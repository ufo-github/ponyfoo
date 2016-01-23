'use strict';

var links = require('../../dat/shortlinks.json');

function setup (app) {
  app.get('/*', expander);
}

function expander (req, res, next) {
  var path = req.path;
  if (!links.hasOwnProperty(path)) {
    next(); return;
  }
  var link = links[path];
  var status = Number(link.status) || 302;
  res.status(status).redirect(link.url);
}

module.exports = {
  setup: setup
};
