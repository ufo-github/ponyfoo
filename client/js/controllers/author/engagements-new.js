'use strict';

var $ = require('dominus');
var loadScript = require('../../lib/loadScript');

module.exports = function () {
  loadScript('/js/rome.js', function loaded () {
    var rome = global.rome;
    var start = $.findOne('.aen-start');
    var end = $.findOne('.aen-end');
    rome(start, { time: false, inputFormat: 'DD-MM-YYYY' });
    rome(end,   { time: false, inputFormat: 'DD-MM-YYYY' });
  });
};
