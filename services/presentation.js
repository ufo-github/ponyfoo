'use strict';

var url = require('url');
var env = require('../lib/env');
var datetimeService = require('./datetime');
var authority = env('AUTHORITY');

function toModel (presentation) {
  return {
    presented: datetimeService.field(presentation.presented),
    title: presentation.title,
    slug: presentation.slug,
    description: presentation.descriptionHtml,
    youtube: presentation.youtube,
    vimeo: presentation.vimeo,
    speakerdeck: presentation.speakerdeck && presentation.speakerdeck.id,
    resources: presentation.resources.map(function (resource) {
      var absolute = url.resolve(authority, resource.url);
      var target = absolute.indexOf(authority) === 0 ? null : '_blank';
      return {
        title: resource.titleHtml,
        url: resource.url,
        target: target
      };
    })
  };
}

module.exports = {
  toModel: toModel
};
