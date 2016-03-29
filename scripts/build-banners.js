'use strict';

const fs = require('fs');
const cf = require('colorformat');
const nearest = require('nearest-color');
const hexrgb = require('hexrgb');
const cd = require('color-difference');
const ops = require('color-ops');
const PNG = require('pngjs').PNG;
const pixels = [];
const brandColors = augmentColors({
  'c-black': '#000',
  'c-black-text': '#333',
  'c-black-light': '#555',
  'c-blue': '#1a4d7f',
  'c-twitter-blue': '#55acee',
  'c-light-turquoise': '#5aa9bc',
  'c-dark-turquoise': '#1686a2',
  'c-bright-turquoise': '#6ecce2',
  'c-gray': '#cbc5c0',
  'c-browser-gray': '#f6f6f6',
  'c-light-gray': '#ddd',
  'c-dark-gray': '#999',
  'c-darker-gray': '#777',
  'c-green': '#37ed2c',
  'c-dark-green': '#1bc211', // darken(c-green, 25%)
  'c-dark-green-01': '#e4f9e3',
  'c-dark-green-05': '#8be186',
  'c-light-green': '#c3f0c1',
  'c-green-005': '#f2fcf2',
  'c-light': '#f3f3f3',
  'c-light-orange': '#fefaf6',
  'c-orange': '#f8ab6f',
  'c-orange-06': '#f8c68d',
  'c-orange-light': '#ffeada',
  'c-orange-005': '#fcf8f5',
  'c-orange-dark': '#f3720d',
  'c-pink': '#e92c6c',
  'c-pink-light': '#f4a5c0',
  'c-pink-01': '#fceaf0',
  'c-pink-005': '#fbf2f5',
  'c-purple': '#900070',
  'c-purple-005': '#f7f0f5',
  'c-red': '#ff0056',
  'c-red-005': '#fcf0f4',
  'c-true-white': '#fff',
  'c-white': '#fcfcfc',
  'c-yellow': '#f1e05a',
  'c-yellow-075': '#f4e98c',
  'c-yellow-04': '#f8f2bc',
  'c-yellow-03': '#fbf7db',
  'c-yellow-01': '#fbf9ec',
  'c-yellow-005': '#fcfbf5',
  'c-yellow-highlight': '#ffe270',
  'c-yellow-highlight-08': '#fee68b',
  'c-yellow-highlight-04': '#fef2c5'
});
const nearestFromBrand = nearest.from(brandColors);

fs.createReadStream('resources/banners/_template-source.png')
  .pipe(new PNG({ filterType: 4 }))
  .on('parsed', function () {

    for (let y = 5; y < this.height; y += 10) {
      for (let x = 5; x < this.width; x += 10) {
        const idx = (this.width * y + x) << 2;
        const original = cf.rgbToHex(
          this.data[idx],
          this.data[idx + 1],
          this.data[idx + 2]
        );
        const brand = nearestFromBrand(original).value;
        const diff = cd.compare(original, brand);
        pixels.push({
          y: (y - 5) / 10,
          x: (x - 5) / 10,
          original,
          brand,
          diff
        });
      }
    }

    const template = `
block mixin_vars
block template_vars

-
  options = options || {}

  unit = 10
  unitsX = 150
  unitsY = 50
  width = options.width ? options.width : unitsX * unit
  height = options.height ? options.height : unitsY * unit
  viewbox = options.viewbox ? options.viewbox : '0 0 ' + unitsX + ' ' + unitsY
  viewbox = viewbox.split(' ').map(function (x) {
    return parseInt(x, 10)
  })
  viewbox = viewbox.join(' ')

  pixels = [
    ${
      pixels
        .map(p => JSON.stringify(p)
          .replace(/(")([A-z]+)("):/g, ` $2: `)
          .replace(/"/g, `'`)
          .replace(/}$/, ` }`)
        )
        .join(',\n    ')
    }
  ]

  function getFill (pixel) {
    var color = options.getFill ? options.getFill(pixel) : pixel.original
    if (color) { return color; }
    return false;
  }

svg(
  xmlns='http://www.w3.org/2000/svg',
  xmlns:xlink='http://www.w3.org/1999/xlink',
  width=width,
  height=height,
  viewBox=viewbox,
  shape-rendering='crispEdges',
  aria-hidden='true'
)
  each pixel in pixels
    -
      x = pixel.x || false
      y = pixel.y || false
    rect(width=1, height=1, x=x, y=y, fill=getFill(pixel))
`;

    fs.writeFile('resources/banners/_template.jade', template.trim() + '\n', 'utf8');
  });

function augmentColors (colors) {
  Object.keys(colors).forEach(name => {
    const rgb = hexrgb.hex2rgb(colors[name], true);
    rgb.push(1);
    many(-20, 60, i => addColor(name, ops.lighten(rgb, i)));
    many(-20, 60, i => addColor(name, ops.spin(rgb, i)));
    many(-10, 10, i => addColor(name, ops.saturate(rgb, i)));
  });
  return colors;
  function addColor(name, color) {
    const hex = hexrgb.rgb2hex(color);
    if (hex.length !== 7) { return; }
    let key;
    while (true) {
      key = `${name}-${getCode()}`;
      if (!(key in colors)) {
        colors[key] = hex; break;
      }
    }
  }
}

function getCode () {
  return Math.random().toString(18).substr(2);
}

function many (start, end, fn) {
  Array(end - start).fill().map((_, i) => i + start).filter(i => i !== 0).forEach(fn);
}
