'use strict';

const tagService = require('../../../services/tag');

function getAll (req, res, next) {
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
      list: result.unused
    }]);
  }
}

module.exports = getAll;
