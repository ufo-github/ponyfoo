'use strict';

const _ = require('lodash');
const minimist = require('minimist');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const SVGO = require('svgo');
const jadum = require('jadum');
const mkdirp = require('mkdirp');
const svg2png = require('svg2png');
const spritesmith = require('spritesmith');
const promisify = require('bluebird').promisify;
const svgo = new SVGO();
const pglob = promisify(glob);
const pmkdirp = promisify(mkdirp);
const pwriteFile = promisify(fs.writeFile);
const preadFile = promisify(fs.readFile);
const psprite = promisify(spritesmith.run);
const argv = minimist(process.argv.slice(2), {
  alias: {
    debug: ['d']
  },
  default: {
    debug: true
  }
});
const rtouch = /touch-icon/i;
const rtext = /-text/i;
const rpadded = /-padded/i;
const rwidth = /width="(\d+)"/i;
const rheight = /height="(\d+)"/i;
const rext = /\.[a-z]+$/i;
const rbanner = /banners$/i;
const resourceTypes = process.env.RESOURCE_TYPES || 'banners,logos';
const resOpen = resourceTypes.indexOf(',') !== -1 ? '{' : '';
const resClose = resourceTypes.indexOf(',') !== -1 ? '}' : '';

pglob(`resources/${resOpen + resourceTypes + resClose}/**/*.jade`)
  .then(files => files.filter(file => path.basename(file)[0] !== '_'))
  .then(files => files.map(source => {
    const dir = path.dirname(source);
    const base = path.basename(source, '.jade');
    const raw = base + '.svg';
    const optimized = base + '.min.svg';
    const markup = jadum.renderFile(source, {
      pretty: argv.debug,
      compileDebug: argv.debug,
      cache: true
    });
    const destination = getDestination(raw);
    const dest_optim = getDestination(optimized);
    return { source, destination, dest_optim, markup };
    function getDestination (file) {
      const banner = rbanner.test(dir);
      if (banner) {
        return path.join(dir, 'generated', file);
      }
      const touch = rtouch.test(file);
      const text = rtext.test(file);
      const type = touch ? 'touch-icons' : text ? 'text' : 'icons';
      return path.join(dir, 'generated', type, file);
    }
  }))
  .then(resolveAll(file => pmkdirp(path.dirname(file.destination))))
  .then(resolveAll(file => new Promise(resolve => svgo.optimize(file.markup, resolve))
    .then(r => pwriteFile(file.dest_optim, r.data + '\n'))
  ))
  .then(resolveAll(file => pwriteFile(file.destination, file.markup.trim() + '\n')))
  .then(resolveAll(file => preadFile(file.destination)
    .then(buffer => svg2png(buffer, {
      width: parseInt(file.markup.match(rwidth)[1]),
      height: parseInt(file.markup.match(rheight)[1])
    }))
    .then(buffer => pwriteFile(changeExtension(file.destination, '.png'), buffer))
  ))
  .then(files => files.reduce((buckets, file) => {
    const dir = path.dirname(file.source);
    if (!(dir in buckets)) { buckets[dir] = []; }
    buckets[dir].push(file);
    return buckets;
  }, {}))
  .then(resolveAll((bucket, dir) => {
    const banner = rbanner.test(dir);
    const opts = {
      src: bucket.map(file => changeExtension(file.destination, '.png')),
      padding: banner ? 0 : 10,
      algorithm: banner ? 'top-down' : 'binary-tree'
    };
    return psprite(opts).then(result =>
      pwriteFile(`${dir}/generated/all.png`, result.image)
    );
  }, (buckets, fn) => Object.keys(buckets).map(dir => fn(buckets[dir], dir))))
  .catch(reason => console.error(reason));

function resolveAll (fn, mapper) {
  return items => Promise
    .all(mapper ? mapper(items, fn) : items.map(fn))
    .then(() => Promise.resolve(items));
}

function changeExtension (file, ext) {
  return file.replace(rext, ext);
}
