'use strict';

var settingService = require('../../services/setting');

module.exports = function (req, res, next) {
  settingService.get(got);
  function got (err, settings) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Site-wide Settings \u2014 Pony Foo',
        meta: {
          canonical: '/author/settings'
        },
        settings: settingService.toModel(settings)
      }
    };
    next();
  }
};
