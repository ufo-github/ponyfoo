'use strict';

var util = require('util');
var mongoose = require('mongoose');
var util = require('util');
var validator = require('validator');
var ObjectId = mongoose.Schema.Types.ObjectId;

function validate (model) {
  var validation = [];
  if (!model || typeof model !== 'object') {
    validation.push('Invalid request.');
    return validation;
  }
  var sanitized = {
    author: getName(),
    email: getEmail(),
    content: getContent(),
    site: getSite(),
    parent: getParent()
  };
  validation.model = sanitized;

  return validation;

  function getName () {
    var name = validator.toString(model.name).trim();
    if (!name) {
      validation.push(util.format('Your name is required'));
    }
    return name;
  }

  function getEmail () {
    var valid = validator.isEmail(model.email);
    if (valid === false) {
      validation.push('Please provide a valid email address! No spam, promise!');
    }
    return model.email;
  }

  function getContent () {
    var length = 10;
    var valid = validator.isLength(model.content, length);
    if (valid === false) {
      validation.push(util.format('Your comment must be at least %s characters long', length));
    }
    return model.content;
  }

  function getSite () {
    return validator.toString(model.site).trim() || null;
  }

  function getParent () {
    return model.parent ? ObjectId(model.parent) : null;
  }
}

module.exports = validate;
