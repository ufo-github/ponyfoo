'use strict';

var winston = require('winston');
var weeklyService = require('../../../services/weekly');

module.exports = function (req, res) {
  var options = {
    author: req.user,
    slug: req.params.slug,
    model: req.body
  };
  weeklyService.update(options, inserted);
  function inserted (err) {
    if (err) {
      winston.warn(err);
      res.status(500).json({ messages: ['Oops. Something went terribly wrong!'] });
      return;
    }
    res.status(200).json({});
  }
};
