'use strict';

var sampleIssue = require('./lib/sampleIssue.json');
var colorService = require('../../../services/color');
var weeklyService = require('../../../services/weekly');
var weeklyCompilerService = require('../../../services/weeklyCompiler');

module.exports = function (req, res, next) {
  weeklyService.compile(sampleIssue, compiled);
  function compiled (err, sampleIssue) {
    if (err) {
      next(err); return;
    }
    res.ignoreNotFound = true;
    res.viewModel = {
      leanLayout: true,
      model: {
        title: 'Media Kit \u2014 Pony Foo',
        action: '../server/pdf/mediakit',
        knownTags: weeklyCompilerService.knownTags,
        sampleIssue: sampleIssue,
        samplePrimary: {
          titleHtml: 'JavaScript Developer Survey',
          href: 'https://ponyfoo.com/articles/javascript-developer-survey-results',
          image: 'https://i.imgur.com/1sPjnYr.png',
          sponsored: true,
          source: 'Company, Inc.',
          sourceHref: 'https://example.com',
          descriptionHtml: 'Results are in! The latest JavaScript developer survey got over 5000 responses. Read our detailed analysis and sign up for our analytics service today.',
          foreground: colorService.colors.darkOrange.hex,
          tags: []
        },
        sampleLink: {
          titleHtml: 'JavaScript Developer Survey',
          href: 'https://ponyfoo.com/articles/javascript-developer-survey-results',
          sponsored: true,
          source: 'Company, Inc.',
          sourceHref: 'https://example.com',
          descriptionHtml: 'Results are in! The latest JavaScript developer survey got over 5000 responses. Read our detailed analysis and sign up for our analytics service today.',
          foreground: colorService.colors.darkTurquoise.hex,
          tags: ['survey']
        },
        sampleJobListing: {
          titleHtml: 'Senior Front-End Engineer at Company, Inc.',
          href: 'https://example.com/jobs/senior-software-engineer',
          source: 'Company, Inc.',
          sourceHref: 'https://example.com',
          descriptionHtml: 'We are hiring the best and brightest senior software engineers to work remotely on our venture-backed analytics startup. Make an impact while earning a competitive salary and benefits.',
          foreground: colorService.colors.red.hex,
          tags: []
        }
      }
    };
    next();
  }
};
