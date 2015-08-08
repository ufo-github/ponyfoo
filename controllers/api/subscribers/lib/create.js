'use strict';

var validator = require('validator');
var subscriberService = require('../../../../services/subscriber');

function create (email, source, done) {
  if (!validator.isEmail(email)) {
    done(null, 400, ['Please subscribe using a valid email address!']); return;
  }

  subscriberService.add({ email: email, source: source || 'intent' }, result);

  function result (err) {
    if (err) {
      done(err); return;
    }
    done(null, 200, ['Thanks! You should be promptly getting an email with activation instructions.']);
  }
}

module.exports = create;
