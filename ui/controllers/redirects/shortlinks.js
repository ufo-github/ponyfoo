'use strict';

const links = require(`../../dat/shortlinks.json`);

function setup (app) {
  app.get(`/bf/:shortlink?`, expander);
  app.get(`/s/:shortlink?`, expander);
}

function expander (req, res, next) {
  const path = req.path;
  if (!Object.prototype.hasOwnProperty.call(links, path)) {
    next(); return;
  }
  const link = links[path];
  res.status(302).redirect(link);
}

module.exports = {
  setup: setup
};
