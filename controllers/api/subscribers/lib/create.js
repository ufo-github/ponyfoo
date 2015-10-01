'use strict';

var validator = require('validator');
var subscriberService = require('../../../../services/subscriber');

function create (email, source, done) {
  if (!validator.isEmail(email)) {
    done(null, 400, ['Please subscribe using a valid email address!']); return;
  }

  subscriberService.add({ email: email, source: source || 'intent' }, result);

  function result (err, success, existed) {
    if (err) {
      done(err); return;
    }
    if (success) {
      done(null, 200, ['Thanks! You should be promptly getting an email with activation instructions.']);
    } else if (existed) {
      done(null, 200, ['Looks like you are already subscribed!']);
    } else {
      done(null, 500, ['Uh, oh! Something went wrong!']);
    }
  }
}

module.exports = create;
