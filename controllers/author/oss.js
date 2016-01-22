'use strict';

var OpenSourceProject = require('../../models/OpenSourceProject');

module.exports = function (req, res, next) {
  OpenSourceProject.find({}).sort('-added').lean().exec(function (err, projects) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Open-Source Projects \u2014 Pony Foo',
        projects: projects.map(function (project) {
          return {
            id: project._id.toString(),
            name: project.name
          };
        })
      }
    };
    next();
  });
};
