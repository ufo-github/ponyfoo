'use strict';

const fs = require('fs');
const but = require('but');
const path = require('path');
const mkdirp = require('mkdirp');
const contra = require('contra');
const moment = require('moment');
const winston = require('winston');
const simpleGit = require('simple-git');
const env = require('../lib/env');
const htmlService = require('../services/html');
const emojiService = require('../services/emoji');
const repository = path.join(process.cwd(), 'sync');
const git = simpleGit(repository);
const enabled = env('GIT_ARTICLES_SYNC');

function getGitDirectory (options) {
  const date = moment(options.created).format('YYYY/MM-DD--');
  const sourceName = date + options.slug;
  const sourceDir = path.join(repository, sourceName);
  return sourceDir;
}

function updateSyncRoot (article, done) {
  if (!enabled) {
    winston.debug('Skipping article filesystem synchronization.');
    done(null);
    return;
  }
  const sourceDir = getGitDirectory({
    created: article.created,
    slug: article.slug
  });
  const files = {
    [path.join(sourceDir, 'metadata.json')]: JSON.stringify({
      id: article._id,
      author: article.author._id || article.author,
      title: article.titleMarkdown,
      slug: article.slug,
      tags: article.tags
    }, null, 2),
    [path.join(sourceDir, 'summary.markdown')]: article.summary,
    [path.join(sourceDir, 'teaser.markdown')]: article.teaser,
    [path.join(sourceDir, 'editor-notes.markdown')]: article.editorNote,
    [path.join(sourceDir, 'introduction.markdown')]: article.introduction,
    [path.join(sourceDir, 'body.markdown')]: article.body,
    [`${sourceDir}.markdown`]: htmlService.absolutize([
      sec(article.titleHtml, 'h1'),
      sec(article.tags.map(tag => sec(tag, 'kbd')).join(' '), 'p'),
      sec(article.summaryHtml, 'blockquote'),
      sec(article.teaserHtml),
      sec(article.editorNoteHtml),
      sec(article.introductionHtml),
      sec(article.bodyHtml)
    ].join('\n\n'))
  };
  const filenames = Object.keys(files);

  contra.series([
    next => mkdirp(sourceDir, next),
    next => contra.concurrent(filenames.map(filename =>
      next => write(filename, files[filename], next)
    ), next)
  ], err => done(err, filenames));

  function sec (html, tag) {
    tag = tag || 'div';
    return `<${tag}>${html || ''}</${tag}>`;
  }
  function write (filename, data, done) {
    fs.writeFile(filename, (data || '').trim() + '\n', 'utf8', done);
  }
}

function update (options, done) {
  if (!enabled) {
    winston.debug('Skipping article git synchronization.');
    done(null);
    return;
  }
  const article = options.article;
  const oldSlug = options.oldSlug;
  const commitMessage = `[sync] Updating “${article.slug}” article from web. ${emojiService.randomFun()}`;
  contra.waterfall([
    next => git.pull(but(next)),
    next => updateSyncRoot(article, next),
    (files, next) => {
      if (oldSlug === article.slug) {
        next(null, files); return;
      }
      const sourceDir = getGitDirectory({
        created: article.created,
        slug: oldSlug
      });
      git.rm(`${sourceDir}*`, err => next(err, files));
    },
    (files, next) => git.commit(commitMessage, files, but(next)),
    next => git.push(but(next))
  ], done);
}

module.exports = {
  updateSyncRoot: updateSyncRoot,
  update: update
};
