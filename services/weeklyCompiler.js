'use strict';

var map = require('contra/map');
var assign = require('assignment');
var beautifyText = require('beautify-text');
var stylus = require('./lib/stylus');
var textService = require('./text');
var weeklyCompilerLinkService = require('./weeklyCompilerLink');
var linkSectionView = require('../.bin/views/shared/partials/weekly/link');
var knownTags = require('./lib/knownNewsletterTags.json');

function compile (sections, options, done) {
  var compilers = {
    header: toHeaderSectionHtml,
    markdown: toMarkdownSectionHtml,
    link: toLinkSectionHtml,
    styles: toStylesSectionHtml
  };
  map(sections, toSectionHtml, mapped);
  function toSectionHtml (section, next) {
    compilers[section.type](section, options, next);
  }
  function mapped (err, result) {
    if (err) {
      done(err); return;
    }
    done(null, result.join(''));
  }
}

function toHeaderSectionHtml (section, options, done) {
  var linkThrough = weeklyCompilerLinkService.linkThroughForSlug(options.slug);
  done(null, textService.format([
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

function toMarkdownSectionHtml (section, options, done) {
  var linkThrough = weeklyCompilerLinkService.linkThroughForSlug(options.slug);
  var html = options.markdown.compile(section.text, {
    linkThrough: linkThrough
  });
  done(null, textService.format('<div class="wy-section-markdown md-markdown">%s</div>', html));
}

function toLinkSectionModel (section, options, done) {
  var linkThrough = weeklyCompilerLinkService.linkThroughForSlug(options.slug);
  var descriptionHtml = options.markdown.compile(section.description, {
    linkThrough: linkThrough
  });
  var base = {
    descriptionHtml: descriptionHtml
  };
  var extended = assign(base, section, {
    titleHtml: options.markdown.compile(section.title, {
      linkThrough: linkThrough
    }),
    href: linkThrough(section.href),
    source: beautifyText(section.source),
    sourceHref: linkThrough(section.sourceHref)
  });
  var model = {
    item: extended,
    knownTags: knownTags
  };
  done(null, model);
}

function compileLinkSectionModel (model) {
  return linkSectionView(model);
}

function toLinkSectionHtml (section, options, done) {
  toLinkSectionModel(section, options, gotModel);
  function gotModel (err, model) {
    if (err) {
      done(err); return;
    }
    done(null, compileLinkSectionModel(model));
  }
}

function toStylesSectionHtml (section, options, done) {
  stylus.render(section.styles, { filename: 'inline-styles.css' }, compiled);
  function compiled (err, styles) {
    done(err, textService.format('<style>%s</style>', styles));
  }
}

function noop () {}

module.exports = {
  compile: compile,
  knownTags: knownTags,
  toHeaderSectionHtml: toHeaderSectionHtml,
  toMarkdownSectionHtml: toMarkdownSectionHtml,
  compileLinkSectionModel: compileLinkSectionModel,
  toLinkSectionModel: toLinkSectionModel,
  toLinkSectionHtml: toLinkSectionHtml,
  toStylesSectionHtml: toStylesSectionHtml
};
