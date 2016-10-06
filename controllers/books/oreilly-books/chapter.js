'use strict';

const contra = require(`contra`);
const assign = require(`assignment`);
const atlasService = require(`../../../services/atlas`);
const oreillyService = require(`../../../services/oreilly`);
const helper = require(`./lib/helper`);

module.exports = function (req, res, next) {
  const bookSlug = req.params.slug;
  const chapterId = parseInt(req.params.chapter, 10);
  if (Number.isNaN(chapterId)) {
    next(`route`); return;
  }
  const options = { bookSlug, chapterId };

  contra.concurrent({
    meta: next => oreillyService.getMetadata({ bookSlug }, next),
    firstChapter: next => atlasService.getFirstChapterLink(bookSlug, next),
    chapter: next => atlasService.getChapter(options, next),
    links: next => atlasService.getChapterLinks(options, next)
  }, respond);

  function respond (err, { meta, firstChapter, chapter, links } = {}) {
    if (err) {
      next(err); return;
    }
    if (!meta || !chapter) {
      next(`route`); return;
    }
    const base = helper.getBaseModel({
      bookSlug,
      meta,
      canonical: `/chapters/${chapterId}`,
      section: chapter.title
    });
    const unlocked = isUnlocked({ user: req.userObject, bookSlug });
    const chapterFields = {
      title: chapter.title,
      html: unlocked ? chapter.html : chapter.teaserHtml
    };
    res.viewModel = {
      model: assign(base, {
        firstChapter,
        chapterId,
        chapter: chapterFields,
        unlocked,
        links
      })
    };
    next();
  }
};

function isUnlocked ({ user, bookSlug }) {
  return user && user.unlockCodes.indexOf(`/books/${bookSlug}`) !== -1;
}
