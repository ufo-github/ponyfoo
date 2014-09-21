'use strict';

var validator = require('validator');
var subscriberService = require('../../../../services/subscriber');

function create (email, done) {
  if (!validator.isEmail(email)) {
    done(null, false, ['Please subscribe using a valid email address!']); return;
  }

  subscriberService.add({ email: email, source: 'intent' }, result);

  function result (err) {
    if (err) {
      done(err); return;
    }
    done(null, true, ['Thanks! You should be promptly getting an email with activation instructions.']);
  }
}

module.exports = create;
