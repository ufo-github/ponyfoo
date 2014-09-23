'use strict';

var create = require('./lib/create');
var accepts = require('../lib/accepts');
var httpService = require('../../../services/http');

function insert (req, res, next) {
  var email = req.body.email;

  create(email, function (err, statusCode, messages) {
    if (err) {
      next(err); return;
    }
    var accept = accepts(req, ['html', 'json']);
    if (accept.json) {
      res.status(statusCode).json({ messages: messages });
    } else {
      req.flash(statusCode === 200 ? 'success' : 'error', messages);
      res.redirect(httpService.referer(req));
    }
  });
}

module.exports = insert;
