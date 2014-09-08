'use strict';

var validator = require('validator');
var subscriberService = require('../../../services/subscriber');

function insert (req, res, next) {
  var email = req.body.email;

  if (!validator.isEmail(email)) {
    res.status(400).json({ messages: ['Please subscribe using a valid email address!'] }); return;
  }

  subscriberService.add({ email: email, source: 'intent' }, respond);

  function respond (err) {
    if (err) {
      next(err); return;
    }
    res.json({});
  }
}

module.exports = insert;
