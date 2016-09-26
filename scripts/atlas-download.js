'use strict';

require(`../preconfigure`);
require(`../chdir`);

const contra = require(`contra`);
const winston = require(`winston`);
const db = require(`../lib/db`);
const boot = require(`../lib/boot`);
const oreillyService = require(`../services/oreilly`);
const atlasBuildService = require(`../services/atlasBuild`);

boot(booted);

function booted () {
  oreillyService.findSlugs(true, (err, slugs) => {
    if (err) {
      downloaded(err); return;
    }
    contra.map.series(slugs, downloadTask, downloaded);
  });
}

function downloadTask (bookSlug, done) {
  winston.info(`Downloading HTML build for ${bookSlug}.`);
  atlasBuildService.download({ bookSlug }, done);
}

function downloaded (err, builds) {
  if (err) {
    winston.error(err);
    end();
    return;
  }
  const hashes = builds
    .reduce((all, build) => all.concat(build), [])
    .map(build => build.hash)
    .join(`,`);
  winston.info(`Downloaded [${ hashes }] HTML builds.`);
  end();
}

function end () {
  db.disconnect(() => process.exit(0));
}
