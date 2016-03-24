'use strict';

const _ = require('lodash');
const minimist = require('minimist');
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const jadum = require('jadum');
const mkdirp = require('mkdirp');
const svg2png = require('svg2png');
const spritesmith = require('spritesmith');
const promisify = require('bluebird').promisify;
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

pglob('resources/logos/**/*.jade')
  .then(files => files.filter(file => path.basename(file)[0] !== '_'))
  .then(files => files.map(file => {
    const base = path.basename(file, '.jade') + '.svg';
    const html = jadum.renderFile(file, {
      pretty: argv.debug,
      compileDebug: argv.debug,
      cache: true
    });
    const type = rtouch.test(base) ? 'touch-icons' : rtext.test(base) ? 'text' : 'icons';
    return {
      source: file,
      destination: path.join('resources/logos/generated', type, base),
      html
    };
  }))
  .then(resolveAll(file => pmkdirp(path.dirname(file.destination))))
  .then(resolveAll(file => pwriteFile(file.destination, file.html.trim() + '\n')))
  .then(resolveAll(file => preadFile(file.destination)
    .then(buffer => svg2png(buffer, {
      width: parseInt(file.html.match(rwidth)[1]),
      height: parseInt(file.html.match(rheight)[1])
    }))
    .then(buffer => pwriteFile(extchange(file.destination, '.png'), buffer))
  ))
  .then(files => files.map(file => extchange(file.destination, '.png')))
  .then(src => psprite({
    src,
    padding: 10
  }))
  .then(result => pwriteFile('resources/logos/generated/all.png', result.image))
  .catch(reason => console.error(reason));

function resolveAll (fn) {
  return items => Promise
    .all(items.map(fn))
    .then(() => Promise.resolve(items));
}

function extchange (file, ext) {
  return file.replace(rext, ext);
}
