'use strict';

var KnownTag = require('../../../models/KnownTag');

module.exports = function (req, res, next) {
  var slug = req.params.slug;
  var editing = !!slug;
  if (slug) {
    KnownTag
      .findOne({ slug: slug })
      .lean()
      .exec(found);
  } else {
    respond({});
  }

  function found (err, tag) {
    if (err) {
      next(err); return;
    }
    if (!tag) {
      next('route'); return;
    }
    respond(tag);
  }

  function respond (tag) {
    res.viewModel = {
      model: {
        title: (editing ? 'Update' : 'New') + ' Tag \u2014 Pony Foo',
        tag: tag,
        editing: editing
      }
    };
    next();
  }
};
