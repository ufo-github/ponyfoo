'use strict';

const contra = require(`contra`);
const assign = require(`assignment`);
const oreillyService = require(`../../../services/oreilly`);
const atlasService = require(`../../../services/atlas`);
const helper = require(`./lib/helper`);

module.exports = function (req, res, next) {
  const bookSlug = req.params.slug;

  contra.concurrent({
    meta: next => oreillyService.getMetadata({ bookSlug }, next),
    firstChapter: next => atlasService.getFirstChapterLink(bookSlug, next),
    tableOfContentsHtml: next => atlasService.getTableOfContents(bookSlug, next)
  }, respond);

  function respond (err, { meta, tableOfContentsHtml, firstChapter } = {}) {
    if (err) {
      next(err); return;
    }
    if (!meta || !tableOfContentsHtml) {
      next(`route`); return;
    }
    const base = helper.getBaseModel({
      bookSlug,
      meta,
      canonical: `/chapters`,
      section: `Table of Contents`
    });
    res.viewModel = {
      model: assign(base, {
        firstChapter,
        tableOfContentsHtml
      })
    };
    next();
  }
};
