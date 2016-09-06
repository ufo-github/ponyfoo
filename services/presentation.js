'use strict';

const util = require(`util`);
const urlService = require(`./url`);
const datetimeService = require(`./datetime`);
const slideFormat = `https://speakerd.s3.amazonaws.com/presentations/%s/slide_0.jpg`;
const youtubeFormat = `https://img.youtube.com/vi/%s/0.jpg`;

function toModel (presentation) {
  const rstrip = /^\s*<p>\s*<\/p>\s*$/i;
  return {
    presented: datetimeService.field(presentation.presented),
    title: presentation.title,
    slug: presentation.slug,
    description: presentation.descriptionHtml,
    youtube: presentation.youtube,
    vimeo: presentation.vimeo,
    speakerdeck: presentation.speakerdeck,
    resources: presentation.resources.map(resource => ({
      title: resource.titleHtml.trim().replace(rstrip, ``),
      url: resource.url,
      target: urlService.getLinkTarget(resource.url)
    }))
  };
}

function toCovers (presentation) {
  const output = [];
  if (presentation.youtube) {
    output.push(util.format(youtubeFormat, presentation.youtube));
  }
  if (presentation.speakerdeck) {
    output.push(util.format(slideFormat, presentation.speakerdeck));
  }
  return output;
}

module.exports = {
  toModel: toModel,
  toCovers: toCovers
};
