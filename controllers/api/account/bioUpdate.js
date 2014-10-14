'use strict';

var contra = require('contra');
var validator = require('validator');
var markdownFatService = require('../../../services/markdownFat');
var bioService = require('../../../services/bio');
var User = require('../../../models/User');

module.exports = function (req, res, next) {
  var bio = validator.toString(req.body.bio);
  var bioHtml = markdownFatService.compile(bio);

  User.findOne({ _id: req.user }, update);

  function update (err, user) {
    if (err) {
      res.status(404).json({ messages: ['Account not found'] }); return;
    }
    user.bio = bio;
    user.bioHtml = bioHtml;
    user.save(saved);
  }

  function saved (err, user) {
    bioService.update(user.email, bio, bioHtml);
    taunus.rebuildDefaultViewModel();
    res.json({});
  }
};
