'use strict';

var winston = require('winston');
var User = require('../../../models/User');

module.exports = function (req, res, next) {
  var id = req.params.id;
  var query = { _id: id };
  User.findOne(query, found);
  function found (err, user) {
    if (err) {
      next(err); return;
    }
    if (!user) {
      winston.warn('User %s failed to delete inexistent user %s.', req.user, id);
      res.status(404).json({ messages: ['Account not found!'] }); return;
    }
    if (user.roles.indexOf('owner') !== -1) {
      winston.warn('User %s failed to delete owner %s.', req.user, id);
      res.status(401).json({ messages: ['Cannot delete owner user!'] }); return;
    }
    if (user._id.equals(req.user)) {
      winston.warn('User %s failed to delete themselves.', req.user);
      res.status(400).json({ messages: ['Cannot delete yourself!'] }); return;
    }
    user.remove(saved);
  }
  function saved (err) {
    if (err) {
      next(err); return;
    }
    winston.warn('User %s deleted user %s.', req.user, id);
    res.json({});
  }
};
