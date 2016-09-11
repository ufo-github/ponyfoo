'use strict';

const loadScript = require(`../lib/loadScript`);

module.exports = function gaSnippet () {
  loadScript(`https://www.google-analytics.com/analytics.js`);

  global.GoogleAnalyticsObject = `ga`;
  global.ga = ga;
  global.ga.l = 1 * new Date();

  function ga (...params) {
    global.ga.q = global.ga.q || [];
    global.ga.q.push(params);
  }
};
