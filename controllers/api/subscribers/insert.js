'use strict';

var validator = require('validator');
var subscriberService = require('../../../services/subscriber');

function insert (req, res, next) {
  var email = req.body.email;

  if (!validator.isEmail(email)) {
    res.json(400, { messages: ['Please subscribe using a valid email address!'] }); return;
  }

  subscriberService.add(email, respond);

  function respond (err) {
    if (err) {
      next(err); return;
    }
    res.json(200);
  }
}

module.exports = insert;
