'use strict';

var winston = require('winston');
var moment = require('moment');
var OpenSourceProject = require('../../../models/OpenSourceProject');

module.exports = function (req, res) {
  OpenSourceProject.remove({ _id: req.body.id }, saved);
  function saved (err) {
    if (err) {
      winston.error(err);
    }
    res.redirect('/opensource/review');
  }
};
