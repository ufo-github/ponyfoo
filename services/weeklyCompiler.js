'use strict';

var map = require('contra/map');
var assign = require('assignment');
var beautifyText = require('beautify-text');
var stylus = require('./lib/stylus');
var textService = require('./text');
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
    compilers[section.type](section, next);
  }
  function mapped (err, result) {
    if (err) {
      done(err); return;
    }
    done(null, result.join(''));
  }
  function toHeaderSectionHtml (section, next) {
    next(null, textService.format('<div class="wy-section-header"><h%s class="md-markdown" style="color:%s;background-color:%s;padding:10px;">%s</h%s></div>',
      section.size,
      section.foreground,
      section.background,
      options.markdown.compile(section.text),
      section.size
    ));
  }
  function toMarkdownSectionHtml (section, next) {
    var html = options.markdown.compile(section.text);
    next(null, textService.format('<div class="wy-section-markdown md-markdown">%s</div>', html));
  }
  function toLinkSectionHtml (section, next) {
    var descriptionHtml = options.markdown.compile(section.description);
    var base = { knownTags: knownTags, descriptionHtml: descriptionHtml };
    var extended = assign(base, section, {
      title: beautifyText(section.title),
      source: beautifyText(section.source)
    });
    next(null, linkSectionView(extended));
  }
  function toStylesSectionHtml (section, next) {
    stylus.render(section.styles, { filename: 'inline-styles.css' }, compiled);
    function compiled (err, styles) {
      next(err, textService.format('<style>%s</style>', styles));
    }
  }
}

module.exports = {
  compile: compile,
  knownTags: knownTags
};
