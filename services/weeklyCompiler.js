'use strict';

var map = require('contra/map');
var assign = require('assignment');
var omnibox = require('omnibox');
var queso = require('queso');
var beautifyText = require('beautify-text');
var stylus = require('./lib/stylus');
var textService = require('./text');
var linkSectionView = require('../.bin/views/shared/partials/weekly/link');
var knownTags = require('./lib/knownNewsletterTags.json');

function linkThrough (href) {
  if (!href) {
    return href;
  }
  var u = omnibox.parse(href);
  if (u.protocol && u.protocol !== 'http' && u.protocol !== 'https') {
    return href;
  }
  u.query.utm_source = 'ponyfoo+weekly';
  u.query.utm_medium = 'email';
  var host = u.host ? u.protocol + '://' + u.host : '';
  return (
    host +
    u.pathname +
    queso.stringify(u.query).replace(/(%2B|\s)/ig, '+') +
    (u.hash || '')
  );
}

function compile (sections, options, done) {
  var compilers = {
    header: toHeaderSectionHtml,
    markdown: toMarkdownSectionHtml,
    link: toLinkSectionHtml,
    styles: toStylesSectionHtml
  };
  map(sections, toSectionHtml, mapped);
  function toSectionHtml (section, next) {
    compilers[section.type](section, next);
  }
  function mapped (err, result) {
    if (err) {
      done(err); return;
    }
    done(null, result.join(''));
  }
  function toHeaderSectionHtml (section, next) {
    next(null, textService.format([
      '<div class="wy-section-header">',
        '<h%s class="md-markdown" style="color:%s;background-color:%s;padding:10px;">',
          '%s',
        '</h%s>',
      '</div>'
      ].join(''),
      section.size,
      section.foreground,
      section.background,
      options.markdown.compile(section.text, {
        linkThrough: linkThrough
      }),
      section.size
    ));
  }
  function toMarkdownSectionHtml (section, next) {
    var html = options.markdown.compile(section.text, {
      linkThrough: linkThrough
    });
    next(null, textService.format('<div class="wy-section-markdown md-markdown">%s</div>', html));
  }
  function toLinkSectionHtml (section, next) {
    var descriptionHtml = options.markdown.compile(section.description, {
      linkThrough: linkThrough
    });
    var base = {
      descriptionHtml: descriptionHtml
    };
    var extended = assign(base, section, {
      title: beautifyText(section.title),
      href: linkThrough(section.href),
      source: beautifyText(section.source),
      sourceHref: linkThrough(section.sourceHref)
    });
    var model = {
      item: extended,
      knownTags: knownTags
    };
    next(null, linkSectionView(model));
  }
  function toStylesSectionHtml (section, next) {
    stylus.render(section.styles, { filename: 'inline-styles.css' }, compiled);
    function compiled (err, styles) {
      next(err, textService.format('<style>%s</style>', styles));
    }
  }
}

function noop () {}

module.exports = {
  compile: compile,
  knownTags: knownTags,
  linkThrough: linkThrough
};
