'use strict';

var emailService = require('../../services/email');
var gravatarService = require('../../services/gravatar');

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
      .replace('cid:_header', '/img/email/header.png')
      .replace('cid:gravatar', gravatarService.format(Math.random()) + '&s=24')
    );
  }
}

module.exports = lastSentEmail;
