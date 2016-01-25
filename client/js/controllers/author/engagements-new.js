'use strict';

var $ = require('dominus');
var rome = require('rome');
var loadScript = require('../../lib/loadScript');

module.exports = function (viewModel, container) {
  loadScript('/js/rome.js', function () {
    var start = $.findOne('.aen-start');
    var end = $.findOne('.aen-end');
    rome(start, { time: false, inputFormat: 'DD-MM-YYYY' });
    rome(end,   { time: false, inputFormat: 'DD-MM-YYYY' });
  });
};
