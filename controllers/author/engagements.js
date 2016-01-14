'use strict';

var datetimeService = require('../../services/datetime');
var Engagement = require('../../models/Engagement');

module.exports = function (req, res, next) {
  Engagement.find({}).sort('-end').lean().exec(function (err, engagements) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Engagements \u2014 Pony Foo',
        engagements: engagements.map(function (engagement) {
          return {
            id: engagement._id.toString(),
            conference: engagement.conference,
            range: datetimeService.range(engagement.start, engagement.end)
          };
        })
      }
    };
    next();
  });
};
