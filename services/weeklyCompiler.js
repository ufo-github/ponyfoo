'use strict';

var map = require('contra/map');
var stylus = require('./lib/stylus');
var textService = require('./text');

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
    next(null, textService.format('<h%s style="color:%s;background-color:%s;padding:10px;">%s</h%s>',
      section.size,
      section.foreground,
      section.background,
      options.markdown.compile(section.text),
      section.size
    ));
  }
  function toMarkdownSectionHtml (section, next) {
    next(null, options.markdown.compile(section.text));
  }
  function toLinkSectionHtml (section, next) {
    next(null, '');
  }
  function toStylesSectionHtml (section, next) {
    stylus.render(section.styles, { filename: 'inline-styles.css' }, compiled);
    function compiled (err, styles) {
      next(err, textService.format('<style>%s</style>', styles));
    }
  }
}

module.exports = {
  compile: compile
};
