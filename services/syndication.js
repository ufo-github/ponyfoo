'use strict';

const _ = require(`lodash`);
const fs = require(`fs`);
const path = require(`path`);
const mkdirp = require(`mkdirp`);
const winston = require(`winston`);
const contra = require(`contra`);
const moment = require(`moment`);
const halfHour = 1000 * 60 * 30;

function create ({ name, location, build }) {
  const rebuildImmediate = () => build(persist);
  const rebuild = _.debounce(rebuildImmediate, halfHour, { leading: true });
  const absoluteLocation = path.resolve(location);
  const syn = contra.emitter({
    name,
    location: absoluteLocation,
    built: false,
    rebuild
  });
  return syn;

  function persist (err, xml) {
    if (err) {
      report(err); return;
    }
    const directory = path.dirname(absoluteLocation);
    mkdirp(directory, err => {
      if (err) {
        report(err); return;
      }
      fs.writeFile(absoluteLocation, xml, report);
    });
  }

  function report (err) {
    if (err) {
      winston.warn(`Error trying to regenerate ${name}`, err); return;
    }
    winston.debug(`Regenerated ${name}`);
    syn.built = moment();
    syn.emit(`built`);
  }
}

module.exports = {
  create
};
