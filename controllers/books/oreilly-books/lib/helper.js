'use strict';

const moment = require(`moment`);
const staticService = require(`../../../../services/static`);
const env = require(`../../../../lib/env`);
const authority = env(`AUTHORITY`);

function getBaseModel ({ meta, bookSlug, canonical, section }) {
  const publication = moment(meta.publication);
  const released = publication.isBefore(moment());
  const publicationFormatted = publication.format(`MMM, YYYY`);
  return {
    title: getTitle(meta, section),
    meta: {
      canonical: `/books/${bookSlug}${canonical}`,
      images: [
        authority + staticService.unroll(`/img/mjavascript/cover-with-text.png`),
        authority + meta.coverHref,
        authority + staticService.unroll(`/img/banners/branded.png`)
      ],
      description: meta.description
    },
    slug: bookSlug,
    data: {
      publisher: meta.publisher,
      title: meta.title,
      teaser: meta.teaser,
      coverHref: meta.coverHref,
      github: meta.github,
      publication: publicationFormatted,
      released,
      pages: meta.pages,
      isbn: meta.isbn,
      summaryHtml: meta.summaryHtml,
      linksHtml: meta.linksHtml
    }
  };
}

function getTitle (meta, section) {
  if (section) {
    return `${section} \u2014 ${meta.title}`;
  }
  return `${meta.title} (${meta.publicationYear}) \u2014 Pony Foo`;
}

module.exports = { getBaseModel };
