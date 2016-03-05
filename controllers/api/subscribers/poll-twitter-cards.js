'use strict';

var winston = require('winston');
var subscriberTwitterService = require('../../../services/subscriberTwitter');

module.exports = function (req, res, next) {
  subscriberTwitterService.pollCards(completed);
  function completed (err) {
    if (err) {
      winston.warn(err);
      res.flash('error', 'An error occurred while retrieving Twitter card data.');
    } else {
      res.flash('success', 'Pulled interested parties from Twitter cards.');
    }
    res.redirect('/author/subscribers');
  }
};
