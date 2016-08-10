'use strict';

const FB = require('fb');
const winston = require('winston');
const env = require('../lib/env');
const pageId = env('FACEBOOK_PAGE_ID');
const accessToken = env('FACEBOOK_ACCESS_TOKEN');
const enabled = pageId && accessToken;
if (enabled) {
  FB.setAccessToken(accessToken);
}
const get = query('get');
const post = query('post');

function noop () {}

function share (status, link, done) {
  const endpoint = pageId + '/feed';
  const data = {
    message: status,
    link: link
  };
  post(endpoint, data, done);
}

function shareFake (status, link, done) {
  const end = done || noop;
  winston.info('FB: ' + status + ' ' + link);
  end();
}

function query (method) {
  return queryWithMethod;
  function queryWithMethod (endpoint, data, done) {
    const end = done || noop;
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
  }
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
  share: enabled ? share : shareFake,
  get: get,
  post: post
};
