'use strict';

var _ = require('lodash');
var util = require('util');
var contra = require('contra');
var request = require('request');
var validator = require('validator');
var gravatarService = require('../../../services/gravatar');
var cache = {};

module.exports = function (req, res, next) {
  var input = Array.isArray(req.body.resources) ? req.body.resources : [];
  var resources = _.uniq(input.map(validator.toString));

  contra.map(resources, 2, fetch, concat);

  function fetch (resource, next) {
    if (cache[resource]) {
      ok();
    } else {
      gravatarService.fetch(resource, true, add);
    }
    function add (err, result) {
      if (err) {
        next(err); return;
      }
      cache[resource] = result;
      ok();
    }
    function ok () {
      next(null, cache[resource]);
    }
  }

  function concat (err, results) {
    if (err) {
      res.status(500).json({}); return;
    }
    var images = results.map(toData).reduce(asKey, {});
    res.json({ images: images });
  }

  function toData (result) {
    return util.format('data:%s;base64,%s', result.mime, result.data);
  }

  function asKey (accumulator, item, i) {
    accumulator[resources[i]] = item;
    return accumulator;
  }
};
