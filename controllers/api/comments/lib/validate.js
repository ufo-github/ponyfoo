'use strict';

var util = require('util');
var validator = require('validator');

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
    var max = 60000;
    var valid = validator.isLength(model.content, length);
    if (valid === false) {
      validation.push(util.format('Comments must be at least %s characters long', length));
    }
    var bound = validator.isLength(model.content, 0, max);
    if (bound === false) {
      validation.push(util.format('Comments can have at most %s characters!', length));
    }
    return model.content;
  }

  function getSite () {
    var scheme = /^https?:\/\//i;
    var input = validator.toString(model.site).trim();
    if (input && !validator.isURL(input)) {
      validation.push('The site is optional, but it should be an URL');
    }
    if (input.length === 0) {
      return null;
    }
    return scheme.test(input) ? input : 'http://' + input;
  }

  function getParent () {
    return model.parent;
  }
}

module.exports = validate;
