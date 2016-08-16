'use strict';

const fs = require(`fs`);
const contra = require(`contra`);
const pkg = require(`../package.json`);
const env = require(`../lib/env`);
const nodeEnv = env(`NODE_ENV`);
const authority = env(`AUTHORITY`);
const staticService = require(`../services/static`);
const popularityService = require(`../services/popularity`);

function read (file) {
  return function (next) {
    fs.readFile(file, { encoding: `utf8` }, next);
  };
}

function getDefaultViewModel (done) {
  contra.concurrent({
    popularArticles: popularityService.getArticles,
    javascriptLoader: read(`.bin/inline/javascript.js`),
    styleLoader: read(`.bin/inline/styles.js`),
    fontLoader: read(`.bin/inline/fonts.js`)
  }, forward);

  function forward (err, data) {
    if (err) {
      done(err); return;
    }

    done(null, {
      rss: `https://feeds.feedburner.com/ponyfoo`,
      founder: {
        contact: `Nicolás Bevacqua <nico@ponyfoo.com>`,
        twitter: `@nzgb`
      },
      description: ``,
      model: {
        environment: nodeEnv,
        authority: authority,
        title: `Pony Foo \u2014 JavaScript consulting, modularity, front-end architecture, performance, and more. Authored by Nicolás Bevacqua`,
        pkg: {
          version: pkg.version
        },
        meta: {
          description: `Pony Foo is a technical blog maintained by Nicolás Bevacqua, where he shares his thoughts on JavaScript and the web. Nico likes writing, public speaking, and open-source.`,
          images: [authority + staticService.unroll(`/img/banners/branded.png`)],
          keywords: []
        },
        popularArticles: data.popularArticles
      },
      javascriptLoader: data.javascriptLoader,
      styleLoader: data.styleLoader,
      fontLoader: data.fontLoader
    });
  }
}

module.exports = getDefaultViewModel;
