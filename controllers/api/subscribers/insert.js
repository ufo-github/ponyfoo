'use strict';

const accepts = require(`accepts`);
const create = require(`./lib/create`);
const httpService = require(`../../../services/http`);
const subscriberService = require(`../../../services/subscriber`);

function insert (req, res, next) {
  const email = req.body.subscriber;
  const source = req.body.source;
  const topics = req.body.topics || subscriberService.getTopics();

  create(email, source, topics, function (err, statusCode, messages) {
    if (err) {
      next(err); return;
    }
    const accept = accepts(req).types(`html`, `json`);
    if (accept === `json`) {
      res.status(statusCode).json({ messages: messages });
    } else {
      req.flash(statusCode === 200 ? `success` : `error`, messages);
      res.redirect(httpService.referer(req));
    }
  });
}

module.exports = insert;
