'use strict';

const truncText = require('trunc-text');
const OpenSourceProject = require('../../models/OpenSourceProject');
const htmlService = require('../../services/html');

module.exports = function (req, res, next) {
  OpenSourceProject.find({}).sort('-added').exec(function (err, projects) {
    if (err) {
      next(err); return;
    }
    if (!projects.length) {
      res.viewModel = { skip: true };
      next(); return;
    }
    const latest = projects[0];
    const descriptionText = htmlService.getText(latest.descriptionHtml);
    const description = truncText(descriptionText, 170);
    res.viewModel = {
      model: {
        title: 'Open-source projects \u2014 Pony Foo',
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
          canonical: '/opensource',
          description: description,
          images: projects.map(toScreenshot)
        }
      }
    };
    next();

    function toScreenshot (project) {
      return project.screenshot;
    }
  });
};
