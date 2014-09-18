'use strict';

var contra = require('contra');
var validator = require('validator');
var markdownService = require('../../../services/markdown');
var bioService = require('../../../services/bio');
var User = require('../../../models/User');
var env = require('../../../lib/env');
var authorEmail = env('AUTHOR_EMAIL');

module.exports = function (req, res, next) {
  var bio = validator.toString(req.body.bio);
  var bioHtml = markdownService.compile(bio);

  User.findOne({ _id: req.user._id }, update);

  function update (err, user) {
    if (err) {
      res.status(404).json({ messages: ['Account not found'] }); return;
    }
    user.bio = bio;
    user.bioHtml = bioHtml;
    user.save(saved);
  }

  function saved (err, user) {
    if (user.email === authorEmail) {
      bioService.update(bioHtml);
    }
    res.json({});
  }
};
