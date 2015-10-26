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
  FB.api(pageId + '/feed', 'post', { message: status, link: link }, normalize);
  function normalize (res) {
    console.log(res);
    if (!res || res.error) {
      (done || noop)(new Error(res.error), res); return;
    }
    (done || noop)(null, res);
  }
}

function fake (status, link, done) {
  winston.info('FB: ' + status + ', ' + link);
  (done || noop)();
}

module.exports = {
  share: enabled ? share : fake
};
