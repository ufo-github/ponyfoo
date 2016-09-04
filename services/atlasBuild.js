'use strict';

const winston = require(`winston`);
const contra = require(`contra`);
const unzip = require(`unzip`);
const request = require(`request`);
const env = require(`../lib/env`);
const atlasService = require(`./atlas`);
const oreillyService = require(`./oreilly`);
const auth_token = env(`ATLAS_API_TOKEN`);
const baseUrl = `https://atlas.oreilly.com`;
const req = request.defaults({ baseUrl, json: true });

function getAllBuilds (meta, done) {
  if (!meta) {
    done(null, []); return;
  }
  const { repo } = meta;
  req({
    method: `GET`,
    url: `/api/builds`,
    form: {
      auth_token,
      project: repo.url
    }
  }, done);
}

function enqueueBuild (formats) {
  return ({ repo }, done) => {
    const enqueuePayload = {
      method: `POST`,
      url: `/api/builds`,
      form: {
        auth_token,
        project: repo.url,
        branch: repo.branch,
        formats
      }
    };
    req(enqueuePayload, done);
  };
}

function download ({ bookSlug, formats = `html` }, done) {
  contra.waterfall([
    getMetadata(bookSlug),
    getAllBuilds,
    findCompletedBuild
  ], done);

  function findCompletedBuild (res, builds, next) {
    const completed = builds.filter(isCompletedBuild);
    if (!completed.length) {
      winston.warn(`No completed ${bookSlug} builds found. Enqueueing a new build.`);
      build({ bookSlug }, next);
      return;
    }
    const [latest] = completed;
    const buildStatus = latest.status;
    downloadBuild({ bookSlug, buildStatus }, next);
  }
}

function getMetadata (bookSlug) {
  return done => oreillyService.getMetadata({ bookSlug, includeNonLive: true }, done);
}

function build ({ bookSlug, formats = `html` }, done) {
  contra.waterfall([
    getMetadata(bookSlug),
    enqueueBuild(formats),
    pollBuildStatus,
    downloadBuild
  ], done);

  function pollBuildStatus (res, build, next) {
    poll(null, res, build);

    function poll (err, res, build) {
      if (err) {
        next(err); return;
      }
      const { build_url, status } = build;
      const completed = isCompletedBuild(build);
      if (completed) {
        next(null, { bookSlug, buildStatus: status }); return;
      }
      const pollPayload = {
        method: `GET`,
        url: build_url,
        form: { auth_token }
      };
      req(pollPayload, poll);
    }
  }
}

function downloadBuild ({ bookSlug, buildStatus }, next) {
  contra.each.series(buildStatus, extract, next);

  function extract ({ download_url, format }, next) {
    const path = getDownloadPath(bookSlug, format);
    const extractor = unzip
      .Extract({ path })
      .on(`error`, next)
      .on(`close`, invalidate);

    request(download_url).pipe(extractor);

    function invalidate () {
      atlasService.invalidateCache(bookSlug);
      next(null);
    }
  }
}

function isCompletedBuild (build) {
  return build.status.every(item => item.status !== `queued`);
}

function getDownloadPath (bookSlug, format) {
  return `./dat/oreilly-books/${bookSlug}/${format}`;
}

module.exports = {
  download,
  build
};
