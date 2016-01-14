'use strict';

var moment = require('moment');
var Presentation = require('../../../models/Presentation');

module.exports = function (req, res) {
  Presentation.remove({ _id: req.body.id }, saved);
  function saved (err) {
    if (err) {
      winston.error(err);
      res.redirect('/author/presentations');
    } else {
      res.redirect('/author/presentations');
    }
  }
};
