'use strict';

const $ = require('dominus');
const loadScript = require('../../lib/loadScript');

module.exports = function () {
  loadScript('/js/rome.js', function loaded () {
    const rome = global.rome;
    const start = $.findOne('.aen-start');
    const end = $.findOne('.aen-end');
    rome(start, { time: false, inputFormat: 'DD-MM-YYYY' });
    rome(end,   { time: false, inputFormat: 'DD-MM-YYYY' });
  });
};
