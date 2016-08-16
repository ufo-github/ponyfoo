'use strict';

const util = require(`util`);
const removeAction = require(`./lib/remove-action`);
const types = {
  articles: `articles`,
  weeklies: `weekly`
};

function remove (req, res, next) {
  removeAction(req, res, next, removed);
  function removed (result) {
    if (result === `not_found`) {
      req.flash(`error`, [`Comment not found.`]);
    }
    const p = req.params;
    const host = util.format(`/%s/%s`, types[p.type], p.slug);
    res.redirect(host);
  }
}

module.exports = remove;
