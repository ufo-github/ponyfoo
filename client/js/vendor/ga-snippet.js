'use strict';

require('../lib/loadScript')('//www.google-analytics.com/analytics.js');

var w = global;

w.GoogleAnalyticsObject = 'ga';
w.ga = function() {
  (w.ga.q = w.ga.q || []).push(arguments);
};
w.ga.l = 1 * new Date();
