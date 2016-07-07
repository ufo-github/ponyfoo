'use strict';

var tagService = require('../../../services/tag');

function remove (req, res, next) {
  tagService.getAll(respond);

  function respond (err, result) {
    if (err) {
      next(err); return;
    }
    res.json([{
      id: 'Previously Used Tags',
      list: result.used
    }, {
      id: 'Known Tags',
      list: result.known
    }]);
  }
}

module.exports = remove;
