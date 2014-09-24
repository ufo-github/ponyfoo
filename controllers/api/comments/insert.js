'use strict';

var create = require('./lib/create');
var accepts = require('../lib/accepts');
var httpService = require('../../../services/http');

function insert (req, res, next) {
  var model = {
    name: req.body.name,
    email: req.body.email,
    site: req.body.site,
    content: req.body.content,
    parent: req.body.parent
  };

  create(req.params.slug, model, function (err, statusCode, messages, inserted) {
    if (err) {
      next(err); return;
    }
    var accept = accepts(req, ['html', 'json']);
    if (accept.json) {
      if (inserted) {
        res.status(statusCode).json(inserted);
      } else {
        res.status(statusCode).json({ messages: messages });
      }
    } else {
      req.flash(statusCode === 200 ? 'success' : 'error', messages);
      res.redirect(httpService.referer(req));
    }
  });
}

module.exports = insert;
