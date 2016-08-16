'use strict';

const validator = require(`validator`);
const subscriberService = require(`../../../../services/subscriber`);

function create (email, source, topics, done) {
  if (!validator.isEmail(email)) {
    done(null, 400, [`Please subscribe using a valid email address!`]); return;
  }
  if (topics.length === 0) {
    done(null, 200, [`Pick at least one topic. Come on, you know you want to.`]); return;
  }

  subscriberService.addTopics({
    email: email,
    source: source || `intent`
  }, topics, result);

  function result (err, success, existed) {
    if (err) {
      done(err); return;
    }
    if (success) {
      done(null, 200, [`Thanks! You should be promptly getting an email with activation instructions.`]);
    } else if (existed) {
      done(null, 200, [`Looks like you are already subscribed!`]);
    } else {
      done(null, 500, [`Uh, oh! Something went wrong!`]);
    }
  }
}

module.exports = create;
