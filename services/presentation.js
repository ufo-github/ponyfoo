'use strict';

var url = require('url');
var util = require('util');
var env = require('../lib/env');
var datetimeService = require('./datetime');
var authority = env('AUTHORITY');
var slideFormat = 'https://speakerd.s3.amazonaws.com/presentations/%s/slide_0.jpg'
var youtubeFormat = 'http://img.youtube.com/vi/%s/0.jpg'

function toModel (presentation) {
  return {
    presented: datetimeService.field(presentation.presented),
    title: presentation.title,
    slug: presentation.slug,
    description: presentation.descriptionHtml,
    youtube: presentation.youtube,
    vimeo: presentation.vimeo,
    speakerdeck: presentation.speakerdeck,
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

function toCovers (presentation) {
  var output = [];
  if (presentation.speakerdeck) {
    output.push(util.format(slideFormat, presentation.speakerdeck));
  }
  if (presentation.youtube) {
    output.push(util.format(youtubeFormat, presentation.youtube));
  }
  return output;
}

module.exports = {
  toModel: toModel,
  toCovers: toCovers
};
