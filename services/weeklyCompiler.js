'use strict';

const map = require(`contra/map`);
const assign = require(`assignment`);
const beautifyText = require(`beautify-text`);
const stylus = require(`./lib/stylus`);
const textService = require(`./text`);
const weeklyCompilerLinkService = require(`./weeklyCompilerLink`);
const linkSectionView = require(`../.bin/views/shared/partials/weekly/link`);
const knownTags = require(`./lib/knownNewsletterTags.json`);

function compile (sections, options, done) {
  const compilers = {
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
    done(null, result.join(``));
  }
}

function toHeaderSectionHtml (section, options, done) {
  const linkThrough = weeklyCompilerLinkService.linkThroughForSlug(options.slug);
  done(null, textService.format([
    `<div class="wy-section-header">`,
    `<h%s class="md-markdown" style="color:%s;background-color:%s;padding:10px;">`,
    `%s`,
    `</h%s>`,
    `</div>`
  ].join(``),
    section.size,
    section.foreground,
    section.background,
    options.markdown.compile(section.text, { linkThrough }),
    section.size
  ));
}

function toMarkdownSectionHtml (section, options, done) {
  const linkThrough = weeklyCompilerLinkService.linkThroughForSlug(options.slug);
  const html = options.markdown.compile(section.text, { linkThrough });
  done(null, textService.format(`<div class="wy-section-markdown md-markdown">%s</div>`, html));
}

function toLinkSectionModel (section, options, done) {
  const linkThrough = weeklyCompilerLinkService.linkThroughForSlug(options.slug);
  const descriptionHtml = options.markdown.compile(section.description, { linkThrough });
  const base = {
    descriptionHtml: descriptionHtml
  };
  const extended = assign(base, section, {
    titleHtml: options.markdown.compile(section.title, { linkThrough }),
    href: linkThrough(section.href),
    source: beautifyText(section.source),
    sourceHref: linkThrough(section.sourceHref)
  });
  const model = {
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
  stylus.render(section.styles, { filename: `inline-styles.css` }, compiled);
  function compiled (err, styles) {
    done(err, textService.format(`<style>%s</style>`, styles));
  }
}

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
