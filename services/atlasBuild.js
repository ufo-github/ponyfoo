'use strict';

const flatten = require(`lodash/flatten`);
const find = require(`lodash/find`);
const assign = require(`assignment`);
const winston = require(`winston`);
const contra = require(`contra`);
const unzip = require(`unzip`);
const request = require(`request`);
const env = require(`../lib/env`);
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
        formats: formats.join(`,`)
      }
    };
    req(enqueuePayload, done);
  };
}

function download ({ bookSlug, formats = [`html`] }, done) {
  contra.waterfall([
    getMetadata(bookSlug),
    getAllBuilds,
    findCompletedBuilds
  ], done);

  function findCompletedBuilds (res, builds, next) {
    if (!Array.isArray(builds)) {
      next(new Error(`Couldn't download builds for ${bookSlug}.`)); return;
    }
    const buildStatuses = flatten(builds.map(({ status }) => status))
      .filter(isCompletedBuild)
      .filter(hasFormat(formats));

    const completedBuilds = formats.reduce(intoBuildHash(buildStatuses), {});
    const completedBuildFormats = Object.keys(completedBuilds);
    const missingBuilds = formats.filter(format => completedBuildFormats.indexOf(format) === -1);

    if (missingBuilds.length) {
      winston.warn(`No completed ${bookSlug} [${ missingBuilds.join(`,`) }] builds found. Enqueueing a new build.`);
      build({ bookSlug, formats: missingBuilds }, downloadTogether);
      return;
    }
    downloadTogether(null, {});

    function downloadTogether (err, freshBuilds) {
      if (err) {
        next(err); return;
      }
      const builds = assign({}, completedBuilds, freshBuilds);
      winston.debug(`Found all ${bookSlug} builds, downloading.`);
      downloadBuilds({ bookSlug, builds }, next);
    }
  }
}

function intoBuildHash (buildStatuses) {
  return (result, format) => {
    const build = find(buildStatuses, { format });
    if (build) {
      result[format] = build;
    }
    return result;
  };
}

function isCompletedBuild (build) {
  return build.status === `completed` && !isFailedBuild(build);
}

function isFailedBuild ({ message }) {
  return message && message.error && message.error.length > 0;
}

function hasFormat (formats) {
  return item => formats.indexOf(item.format) !== -1;
}

function getMetadata (bookSlug) {
  return done => oreillyService.getMetadata({ bookSlug, includeNonLive: true }, done);
}

function build ({ bookSlug, formats = [`html`] }, done) {
  contra.waterfall([
    getMetadata(bookSlug),
    enqueueBuild(formats),
    pollBuildStatus
  ], done);

  function pollBuildStatus (res, build, next) {
    let sleepTime = 1000;

    poll(null, res, build);

    function poll (err, res, build) {
      if (err) {
        next(err); return;
      }

      const { build_url, status } = build;
      const finishedBuilds = status.filter(({ status }) => status === `completed`);
      const failedBuilds = finishedBuilds.filter(isFailedBuild);
      const successfulBuilds = finishedBuilds.filter(build => !isFailedBuild(build));
      const completedBuilds = formats.reduce(intoBuildHash(successfulBuilds), {});
      const completedBuildFormats = Object.keys(completedBuilds);
      const missingBuilds = formats.filter(format => completedBuildFormats.indexOf(format) === -1);

      if (failedBuilds.length) {
        winston.warn(`Some builds failed.`, failedBuilds);
        next(new Error(`Some builds failed.`)); return;
      }
      if (missingBuilds.length) {
        pollInterval(); return;
      }

      next(null, completedBuilds);

      function pollInterval () {
        sleepTime = Math.min(sleepTime + 500, 10000);
        winston.debug(`Missing builds [${ missingBuilds.join(`,`) }]. Polling in ${ sleepTime / 1000 }s.`);
        setTimeout(() => {
          const pollPayload = {
            method: `GET`,
            url: build_url,
            form: { auth_token }
          };
          req(pollPayload, poll);
        }, sleepTime);
      }
    }
  }
}

function downloadBuilds ({ bookSlug, builds }, next) {
  contra.map.series(builds, extract, next);

  function extract ({ id, download_url, format }, next) {
    const path = getDownloadDirectory(bookSlug, format);
    const extractor = unzip
      .Extract({ path })
      .on(`error`, next)
      .on(`close`, closed);

    winston.debug(`Downloading ${ download_url }...`);
    request(download_url).pipe(extractor);

    function closed () {
      const rhash = /([a-f0-9]+)\.zip$/;
      const [, download_hash] = download_url.match(rhash);
      const hash = `${ id }_${ download_hash }`;
      next(null, { hash });
    }
  }
}

function getDownloadDirectory (bookSlug, format) {
  return `./dat/oreilly-books/${bookSlug}/${format}`;
}

module.exports = { download, build };
