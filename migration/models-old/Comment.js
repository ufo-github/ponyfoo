'use strict';

var mongoose = require('mongoose'),
    Comment = require('./schema/Comment.js');

module.exports = function (conn) {
  return conn.model('comment', Comment);
};
