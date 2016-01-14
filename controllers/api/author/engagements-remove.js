'use strict';

var moment = require('moment');
var Engagement = require('../../../models/Engagement');

module.exports = function (req, res) {
  console.log(req.body);
  Engagement.remove({ _id: req.body.id }, saved);
  function saved (err) {
    if (err) {
      winston.error(err);
      res.redirect('/author/engagements');
    } else {
      res.redirect('/author/engagements');
    }
  }
};
