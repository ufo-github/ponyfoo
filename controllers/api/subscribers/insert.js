'use strict';

var accepts = require('accepts');
var create = require('./lib/create');
var httpService = require('../../../services/http');
var subscriberService = require('../../../services/subscriber');

function insert (req, res, next) {
  var email = req.body.subscriber;
  var source = req.body.source;
  var topics = req.body.topics || subscriberService.getTopics();

  create(email, source, topics, function (err, statusCode, messages) {
    if (err) {
      next(err); return;
    }
    var accept = accepts(req).types('html', 'json');
    if (accept === 'json') {
      res.status(statusCode).json({ messages: messages });
    } else {
      req.flash(statusCode === 200 ? 'success' : 'error', messages);
      res.redirect(httpService.referer(req));
    }
  });
}

module.exports = insert;
