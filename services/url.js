'use strict';

const url = require(`url`);
const env = require(`../lib/env`);
const authority = env(`AUTHORITY`);

function isLocal (href) {
  const absolute = url.resolve(authority, href);
  const isLocal = absolute.indexOf(authority) === 0;
  return isLocal;
}

function getLinkTarget (href) {
  return isLocal(href) ? null : `_blank`;
}

module.exports = { isLocal, getLinkTarget };
