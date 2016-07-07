'use strict';

var KnownTag = require('../../../models/KnownTag');

module.exports = function (req, res, next) {
  KnownTag
    .find({})
    .sort('-created')
    .lean()
    .exec(found);

  function found (err, tags) {
    if (err) {
      next(err); return;
    }
    res.viewModel = {
      model: {
        title: 'Tags \u2014 Pony Foo',
        meta: {
          canonical: '/articles/tags'
        },
        tags: tags.map(toTagReviewModel)
      }
    };
    next();
  }

  function toTagReviewModel (tag) {
    return {
      created: tag.created,
      slug: tag.slug,
      titleHtml: tag.titleHtml
    };
  }
};
