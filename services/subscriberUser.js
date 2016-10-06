'use strict';

const subscriberService = require(`./subscriber`);

function add ({ user, codes = [] }, done) {
  const source = getSource(codes);

  subscriberService.add({
    created: user.created,
    email: user.email,
    name: user.displayName,
    source,
    verified: true
  }, done);
}

function getSource (codes) {
  if (codes.length === 0) {
    return `registration`;
  }
  return `promo+${ codes.join(`,`) }`;
}

module.exports = {
  add
};
