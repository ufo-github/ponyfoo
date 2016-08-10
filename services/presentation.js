'use strict';

const url = require('url');
const util = require('util');
const env = require('../lib/env');
const datetimeService = require('./datetime');
const authority = env('AUTHORITY');
const slideFormat = 'https://speakerd.s3.amazonaws.com/presentations/%s/slide_0.jpg';
const youtubeFormat = 'https://img.youtube.com/vi/%s/0.jpg';

function toModel (presentation) {
  const rparagraph = /^<p>|<\/p>$/ig;
  return {
    presented: datetimeService.field(presentation.presented),
    title: presentation.title,
    slug: presentation.slug,
    description: presentation.descriptionHtml,
    youtube: presentation.youtube,
    vimeo: presentation.vimeo,
    speakerdeck: presentation.speakerdeck,
    resources: presentation.resources.map(function (resource) {
      const absolute = url.resolve(authority, resource.url);
      const target = absolute.indexOf(authority) === 0 ? null : '_blank';
      return {
        title: resource.titleHtml.trim().replace(rparagraph, ''),
        url: resource.url,
        target: target
      };
    })
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
