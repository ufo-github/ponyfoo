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
const articleService = require('../services/article');
const Article = require('../models/Article');
const enabled = env('GIT_ARTICLES_SYNC');
const repository = path.join(process.cwd(), 'sync');
const git = simpleGit(repository);
const rsyncroot = /^\d{4}\/\d{2}-\d{2}--[a-z0-9-]+$/i;

function getGitDirectory (options) {
  const date = moment.utc(options.created).format('YYYY/MM-DD--');
  const slug = date + options.slug;
  const sources = path.join(repository, slug);
  return sources;
}

function updateSyncRoot (article, done) {
  if (!enabled) {
    winston.debug('Skipping filesystem synchronization from database.');
    done(null);
    return;
  }
  const sources = getGitDirectory({
    created: article.created,
    slug: article.slug
  });
  const d = file => path.join(sources, file);
  const files = {
    [d('metadata.json')]: JSON.stringify({
      id: article._id,
      author: article.author._id || article.author,
      title: article.titleMarkdown,
      slug: article.slug,
      tags: article.tags,
      heroImage: article.heroImage || null
    }, null, 2),
    [d('summary.markdown')]: article.summary,
    [d('teaser.markdown')]: article.teaser,
    [d('editor-notes.markdown')]: article.editorNote,
    [d('introduction.markdown')]: article.introduction,
    [d('body.markdown')]: article.body,
    [d('readme.markdown')]: htmlService.downgradeEmojiImages(htmlService.absolutize([
      section(article.heroImage ? `<img src='${article.heroImage}' alt='${article.title}' />` : ''),
      section(article.titleHtml, 'h1'),
      section(article.tags.map(tag => section(tag, 'kbd')).join(' '), 'p'),
      section(article.summaryHtml, 'blockquote'),
      section(article.teaserHtml),
      section(article.editorNoteHtml),
      section(article.introductionHtml),
      section(article.bodyHtml)
    ].join('\n\n')))
  };
  const filenames = Object.keys(files);

  contra.series([
    next => mkdirp(sources, next),
    next => contra.concurrent(filenames.map(filename =>
      next => write(filename, files[filename], next)
    ), next)
  ], err => done(err, filenames));

  function section (html, tag) {
    tag = tag || 'div';
    return `<${tag}>${html || ''}</${tag}>`;
  }
  function write (filename, data, done) {
    fs.writeFile(filename, trimRight(data) + '\n', 'utf8', done);
  }
}

function pushToGit (options, done) {
  if (!enabled) {
    winston.debug('Skipping git synchronization from database.');
    done(null);
    return;
  }
  const article = options.article;
  const oldSlug = options.oldSlug;
  const tasks = [
    next => git.pull(but(next)),
    next => updateSyncRoot(article, next)
  ];

  if (oldSlug !== article.slug) {
    tasks.push(removeOldSources);
  }

  tasks.push(commitNewSources);
  contra.waterfall(tasks, done);

  function removeOldSources (files, next) {
    const sources = getGitDirectory({
      created: article.created,
      slug: oldSlug
    });
    git.rm(`${sources}*`, err => next(err, files));
  }

  function commitNewSources (files, next) {
    const emoji = emojiService.randomFun();
    const commitMessage = `[sync] Updating “${article.slug}” article. ${emoji}`;

    contra.series([
      next => git.commit(commitMessage, files, next),
      next => git.push(next)
    ], next);
  }
}

function removeFromGit (article, done) {
  if (!enabled) {
    winston.debug('Skipping git synchronization from database.');
    done(null);
    return;
  }

  const sources = getGitDirectory({
    created: article.created,
    slug: article.slug
  });
  const commitMessage = `[sync] Removing “${article.slug}” article. ${emojiService.randomFun()}`;
  contra.series([
    next => git.pull(next),
    next => git.rm(`${sources}*`, next),
    next => git.commit(commitMessage, next),
    next => git.push(next)
  ], done);
}

function pullFromGit (event, done) {
  const end = done || log;

  if (!enabled) {
    winston.debug('Skipping database synchronization from git.');
    end(null);
    return;
  }

  const removals = intoChangeDirectories(event.payload.commits
    .reduce((all, commit) => all.concat(commit.removed), [])
    .filter(file => path.basename(file) === 'metadata.json')
  );
  const modifications = intoChangeDirectories(event.payload.commits
    .reduce((all, commit) => all.concat(commit.modified), [])
  );

  if (removals.length === 0 && modifications.length === 0) {
    end(null); return;
  }

  contra.series([
    next => contra.each.series(removals, removeArticle, next),
    next => git.pull(next),
    next => contra.each.series(modifications, updateArticle, next)
  ], end);

  function intoChangeDirectories (list) {
    return list
      .map(file => path.dirname(file))
      .filter(dir => rsyncroot.test(dir))
      .map(dir => path.join(repository, dir));
  }

  function removeArticle (dir, next) {
    const metadata = path.join(dir, 'metadata.json');
    contra.waterfall([
      next => fs.readFile(metadata, 'utf8', next),
      (data, next) => next(null, JSON.parse(data)),
      (data, next) => Article.findOne({ _id: data.id }, next),
      (article, next) => {
        articleService.remove(article, next);
      }
    ], next);
  }

  function updateArticle (dir, next) {
    const readFile = file => next => fs.readFile(path.join(dir, file), 'utf8', next);

    contra.concurrent({
      metadata: readFile('metadata.json'),
      summary: readFile('summary.markdown'),
      teaser: readFile('teaser.markdown'),
      editorNote: readFile('editor-notes.markdown'),
      introduction: readFile('introduction.markdown'),
      body: readFile('body.markdown')
    }, mergeFiles);

    function mergeFiles (err, data) {
      if (err) {
        next(err); return;
      }
      const metadata = JSON.parse(data.metadata);
      const query = {
        _id: metadata.id,
        author: metadata.author
      };

      Article.findOne(query).exec(found);

      function found (err, article) {
        if (err) {
          next(err); return;
        }
        if (!article) {
          next(new Error(`Article couldn't be found!`)); return;
        }
        const fromGit = {
          status: article.status,
          titleMarkdown: metadata.title,
          slug: metadata.slug,
          tags: metadata.tags,
          heroImage: metadata.heroImage || '',
          summary: trimRight(data.summary),
          teaser: trimRight(data.teaser),
          editorNote: trimRight(data.editorNote),
          introduction: trimRight(data.introduction),
          body: trimRight(data.body)
        };
        const sign = articleService.computeSignature(fromGit);
        if (sign === article.sign) {
          next(null); return;
        }
        article.titleMarkdown = fromGit.titleMarkdown;
        article.slug = fromGit.slug;
        article.summary = fromGit.summary;
        article.teaser = fromGit.teaser;
        article.editorNote = fromGit.editorNote;
        article.introduction = fromGit.introduction;
        article.body = fromGit.body;
        article.tags = fromGit.tags;
        article.heroImage = fromGit.heroImage;
        article.save(but(next));
      }
    }
  }
}

function log (err) {
  if (err) {
    winston.warn('Error pulling commit information from git', err.stack || err);
  }
}

function trimRight (text) {
  const rtrailingnewline = /\n+$/;
  return (text || '').replace(rtrailingnewline, '');
}

module.exports = {
  updateSyncRoot,
  pushToGit,
  removeFromGit,
  pullFromGit
};
