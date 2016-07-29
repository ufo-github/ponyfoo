'use strict';

var contra = require('contra');
var winston = require('winston');
var articleSharingService = require('./articleSharing');

function noop () {}

function share (article, done) {
  if (done === void 0) {
    done = noop;
  }
  contra.concurrent([
    medium('email', 'email'),
    medium('tweet', 'twitter'),
    medium('fb', 'facebook'),
    medium('echojs', 'echojs'),
    medium('hn', 'hackernews')
  ], done);

  function medium (key, method) {
    return function shareVia (next) {
      if (article[key] === false) {
        winston.info('Sharing turned off via "%s" channel for article %s.', method, article.title);
        next(); return;
      }
      winston.info('Sharing article %s via "%s" channel.', article.title, method);
      articleSharingService[method](article, {}, next);
    };
  }
}

module.exports = {
  share: share
};
