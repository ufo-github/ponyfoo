'use strict';

const w = global;

module.exports = function gaSnippet () {
  require('../lib/loadScript')('//www.google-analytics.com/analytics.js');

  w.GoogleAnalyticsObject = 'ga';
  w.ga = ga;
  w.ga.l = 1 * new Date();

  function ga () {
    (w.ga.q = w.ga.q || []).push(arguments);
  }
};
