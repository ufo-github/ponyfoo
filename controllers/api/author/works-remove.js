'use strict';

var moment = require('moment');
var OpenSourceWork = require('../../../models/OpenSourceWork');

module.exports = function (req, res) {
  OpenSourceWork.remove({ _id: req.body.id }, saved);
  function saved (err) {
    if (err) {
      winston.error(err);
      res.redirect('/author/works');
    } else {
      res.redirect('/author/works');
    }
  }
};
