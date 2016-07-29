'use strict';

var Subscriber = require('../../../../models/Subscriber');
var cryptoService = require('../../../../services/crypto');

function unfold (req, res, done) {
  var hash = req.params.hash;
  var id = hash.substr(0, 24);
  var emailHash = hash.substr(24);
  var query = { _id: id };

  Subscriber.findOne(query, found);

  function found (err, subscriber) {
    if (err) {
      done(err); return;
    }
    if (!subscriber) {
      done(null, null); return;
    }
    var emailHashExpectation = cryptoService.md5(subscriber.email);
    if (emailHashExpectation !== emailHash) {
      done(null, null); return;
    }
    done(null, subscriber);
  }
}

module.exports = unfold;
