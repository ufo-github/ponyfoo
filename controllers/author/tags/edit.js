'use strict';

const KnownTag = require('../../../models/KnownTag');

module.exports = function (req, res, next) {
  const slug = req.params.slug;
  const editing = !!slug;
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
