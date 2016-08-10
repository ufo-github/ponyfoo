'use strict';

var weeklyService = require('../../../services/weekly');

module.exports = function (req, res) {
  var model = req.body;
  model.author = req.user;
  weeklyService.insert(model, inserted);
  function inserted (err) {
    if (err) {
      res.status(500).json({ messages: ['Oops. Something went terribly wrong!'] });
      return;
    }
    res.status(200).json({});
  }
};
