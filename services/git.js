'use strict';

var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var contra = require('contra');
var moment = require('moment');
var winston = require('winston');
var htmlService = require('../services/html');
var base = path.join(process.cwd(), 'sync');

function articleToSyncRoot (article, done) {
  const date = moment(article.created).format('YYYY/MM-DD--');
  const dir = path.join(base, date + article.slug);
  contra.series([
    next => mkdirp(dir, next),
    next => contra.concurrent([
      next => {
        winston.debug(date + article.slug);
        next();
      },
      next => write(path.join(dir, 'metadata.json'), JSON.stringify({
        id: article._id,
        author: article.author,
        title: article.titleMarkdown,
        slug: article.slug,
        tags: article.tags
      }, null, 2), next),
      next => write(path.join(dir, 'summary.markdown'), article.summary, next),
      next => write(path.join(dir, 'teaser.markdown'), article.teaser, next),
      next => write(path.join(dir, 'editor-notes.markdown'), article.editorNote, next),
      next => write(path.join(dir, 'introduction.markdown'), article.introduction, next),
      next => write(path.join(dir, 'body.markdown'), article.body, next),
      next => write(path.join(base, date + article.slug + '.markdown'), htmlService.absolutize([
        sec(article.titleHtml, 'h1'),
        sec(article.tags.map(tag => sec(tag, 'kbd')).join(' ')),
        sec(article.summaryHtml, 'blockquote'),
        sec(article.teaserHtml),
        sec(article.editorNoteHtml),
        sec(article.introductionHtml),
        sec(article.bodyHtml)
      ].join('\n\n')), next)
    ], next)
  ], done);

  function sec (html, tag) {
    tag = tag || 'div';
    return `<${tag}>${html || ''}</${tag}>`;
  }
  function write (filename, data, done) {
    fs.writeFile(filename, (data || '').trim() + '\n', 'utf8', done);
  }
}

function articleToGit (article) {

}

// when an article is inserted/updated, run articleToSyncRoot on it.
// - run git clone $GIT_REPO sync after deployment
// - run git pull
// - run git commit for the relevant files
// - run git push -u origin master

module.exports = {
  articleToSyncRoot: articleToSyncRoot
};
