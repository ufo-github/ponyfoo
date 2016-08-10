'use strict';

const winston = require('winston');
const KnownTag = require('../../../models/KnownTag');

module.exports = function (req, res) {
  KnownTag.remove({ slug: req.params.slug }, saved);
  function saved (err) {
    if (err) {
      winston.error(err);
    }
    res.redirect('/articles/tags/review');
  }
};
