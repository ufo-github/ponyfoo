'use strict';

var OpenSourceProject = require('../../models/OpenSourceProject');
var staticService = require('../../services/static');
var textService = require('../../services/text');
var htmlService = require('../../services/html');
var env = require('../../lib/env');
var authority = env('AUTHORITY');

module.exports = function (req, res, next) {
  OpenSourceProject.find({}).sort('-added').exec(function (err, projects) {
    if (err) {
      next(err); return;
    }
    if (!projects.length) {
      res.viewModel = { skip: true };
      next(); return;
    }
    var latest = projects[0];
    var descriptionText = htmlService.getText(latest.descriptionHtml);
    var description = textService.truncate(descriptionText, 170);
    res.viewModel = {
      model: {
        title: 'Conference projects \u2014 Pony Foo',
        projects: projects.map(function (project) {
          return {
            name: project.name,
            repo: project.repo,
            branch: project.branch,
            teaser: project.teaser,
            description: project.descriptionHtml,
            screenshot: project.screenshot
          };
        }),
        meta: {
          description: description,
          images: [latest.screenshot, authority + staticService.unroll('/img/thumbnail.png')]
        }
      }
    };
    next();
  });
};
