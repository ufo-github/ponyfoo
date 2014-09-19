'use strict';

var taunus = require('taunus');
var notFound = '/not-found';

module.exports = function (req, res, next) {
  if (req.url !== notFound) {
    res.redirect(notFound); return;
  }

  var vm = {
    model: {
      title: 'Not Found!',
      meta: {
        canonical: notFound
      }
    }
  };
  taunus.render('error/not-found', vm, req, res, next);
};
