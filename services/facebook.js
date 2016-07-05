'use strict';

var FB = require('fb');
var winston = require('winston');
var env = require('../lib/env');
var pageId = env('FACEBOOK_PAGE_ID');
var accessToken = env('FACEBOOK_ACCESS_TOKEN');
var enabled = pageId && accessToken;
if (enabled) {
  FB.setAccessToken(accessToken);
}

function noop () {}

function share (status, link, done) {
  var endpoint = pageId + '/feed';
  var data = {
    message: status,
    link: link
  };
  query(endpoint, data, done);
}

function fake (status, link, done) {
  var end = done || noop;
  winston.info('FB: ' + status + ' ' + link);
  end();
}

function query (method) {
  return function queryWithMethod (endpoint, data, done) {
    var end = done || noop;
    FB.api(endpoint, method, data, normalize);

    function normalize (result) {
      if (!result || result.error) {
        failed(result); return;
      }
      end(null, result);
    }

    function failed (result) {
      winston.warn('Error while posting to Facebook', result);
      end(getErrorMessage(result));
    }
  };
}

function getErrorMessage (result) {
  if (!result) {
    return result;
  }
  if (result.error) {
    return result.error.stack || result.error;
  }
  return result;
}

module.exports = {
  share: enabled ? share : fake,
  get: query('get'),
  post: query('post')
};
