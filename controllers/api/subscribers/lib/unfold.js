'use strict';

const Subscriber = require('../../../../models/Subscriber');
const cryptoService = require('../../../../services/crypto');

function unfold (req, res, done) {
  const hash = req.params.hash;
  const id = hash.substr(0, 24);
  const emailHash = hash.substr(24);
  const query = { _id: id };

  Subscriber.findOne(query, found);

  function found (err, subscriber) {
    if (err) {
      done(err); return;
    }
    if (!subscriber) {
      done(null, null); return;
    }
    const emailHashExpectation = cryptoService.md5(subscriber.email);
    if (emailHashExpectation !== emailHash) {
      done(null, null); return;
    }
    done(null, subscriber);
  }
}

module.exports = unfold;
