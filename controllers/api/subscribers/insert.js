'use strict';

var accepts = require('./lib/accepts');
var create = require('./lib/create');
var httpService = require('../../../services/http');

function insert (req, res, next) {
  var email = req.body.email;

  create(email, function (err, valid, messages) {
    if (err) {
      next(err); return;
    }
    var accept = accepts(req, ['html', 'json']);
    if (accept.json) {
      res.status(valid ? 200 : 400).json({ messages: messages });
    } else {
      req.flash(valid ? 'success' : 'error', messages);
      res.redirect(httpService.referer(req));
    }
  });
}

module.exports = insert;
