'use strict';

const httpService = require(`../../../services/http`);
const impersonationService = require(`../../../services/impersonation`);

module.exports = function (req, res, next) {
  impersonationService.unset({ impersonator: req.user }, respond);

  function respond (err) {
    if (err) {
      next(err); return;
    }
    httpService.redirect(req, res, `/users/review`, { hard: true });
  }
};
