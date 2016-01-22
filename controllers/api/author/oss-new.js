'use strict';

var moment = require('moment');
var OpenSourceProject = require('../../../models/OpenSourceProject');
var markupService = require('../../../services/markup');

module.exports = function (req, res) {
  var body = req.body;
  var model = {
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
      res.redirect('/author/oss/new');
    } else {
      res.redirect('/author/oss');
    }
  }
};
