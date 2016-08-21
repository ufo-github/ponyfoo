'use strict';

const fs = require(`fs`);
const winston = require(`winston`);
const secret = fs.readFileSync(`.bin/secret`, `utf8`).trim();

function secretOnly (req, res, next) {
  const ok = req.params.secret === secret;
  if (!ok) {
    winston.warn(`Unauthorized request to secret API endpoint.`);
  }
  next(ok ? null : `route`);
}

module.exports = secretOnly;
