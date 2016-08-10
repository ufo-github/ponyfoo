'use strict';

const winston = require('winston');
const OpenSourceProject = require('../../../models/OpenSourceProject');
const markupService = require('../../../services/markup');

module.exports = function (req, res) {
  const body = req.body;
  const model = {
    name: body.name,
    repo: body.repo,
    branch: body.branch,
    screenshot: body.screenshot,
    teaser: body.teaser,
    description: body.description,
    descriptionHtml: markupService.compile(body.description)
  };
  new OpenSourceProject(model).save(saved);
  function saved (err) {
    if (err) {
      winston.error(err);
      res.redirect('/opensource/new');
    } else {
      res.redirect('/opensource/review');
    }
  }
};
