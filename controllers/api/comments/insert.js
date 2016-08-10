'use strict';

const accepts = require('accepts');
const create = require('./lib/create');
const httpService = require('../../../services/http');

function insert (req, res, next) {
  const model = {
    name: req.body.name,
    email: req.body.email,
    site: req.body.site,
    content: req.body.content,
    parent: req.body.parent
  };
  const options = {
    type: req.params.type,
    slug: req.params.slug,
    model: model,
    user: req.user
  };

  create(options, function (err, statusCode, messages, inserted) {
    if (err) {
      next(err); return;
    }
    const accept = accepts(req).types('html', 'json');
    if (accept === 'json') {
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
