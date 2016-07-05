'use strict';

var util = require('util');
var removeAction = require('./lib/remove-action');
var types = {
  articles: 'articles',
  weeklies: 'weekly'
};

function remove (req, res, next) {
  removeAction(req, res, next, removed);
  function removed (result) {
    if (result === 'not_found') {
      req.flash('error', ['Comment not found.']);
    }
    var p = req.params;
    var host = util.format('/%s/%s', types[p.type], p.slug);
    res.redirect(host);
  }
}

module.exports = remove;
