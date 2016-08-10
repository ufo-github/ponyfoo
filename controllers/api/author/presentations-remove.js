'use strict';

const winston = require('winston');
const Presentation = require('../../../models/Presentation');

module.exports = function (req, res) {
  Presentation.remove({ _id: req.body.id }, saved);
  function saved (err) {
    if (err) {
      winston.error(err);
    }
    res.redirect('/presentations/review');
  }
};
