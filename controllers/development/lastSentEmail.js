'use strict';

const emailService = require('../../services/email');
const staticService = require('../../services/static');
const gravatarService = require('../../services/gravatar');

function lastSentEmail (req, res, next) {
  if (!emailService.getLastEmailHtml) {
    next('route'); return;
  }
  emailService.getLastEmailHtml(rendered);
  function rendered (err, html) {
    if (err) {
      next(err); return;
    }
    res.send(html
      .replace('cid:_header', staticService.unroll('/img/banners/branded.png'))
      .replace('cid:gravatar', gravatarService.format(Math.random()) + '&s=24')
    );
  }
}

module.exports = lastSentEmail;
