'use strict';

const removeAction = require(`./lib/remove-action`);

function remove (req, res, next) {
  removeAction(req, res, next, removed);
  function removed (result) {
    if (result === `not_found`) {
      res.status(404).json({ messages: [`Comment not found`] }); return;
    }
    res.json({});
  }
}

module.exports = remove;
