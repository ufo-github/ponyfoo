'use strict';

var $ = require('dominus');
var taunus = require('taunus');
var concurrent = require('contra/concurrent');
var ls = require('../../lib/storage');
var datetimeService = require('../../../../services/datetime');

module.exports = function (viewModel) {
  viewModel.projects.forEach(function (project) {
    var branch = project.branch;
    var repo = project.repo;
    var cacheKey = 'oss:repos/' + repo;
    var cache = ls.get(cacheKey);
    var earlier = new Date();
    earlier.setHours(earlier.getHours() - 6);
    if (cache && new Date(cache.date) > earlier) {
      render({ meta: cache.value });
      return;
    }
    concurrent({
      repo (next) {
        query('/repos/' + repo, next);
      },
      branch (next) {
        query('/repos/' + repo + '/branches/' + branch, next);
      }
    }, pulled);
    function query (url, next) {
      var options = {
        url: 'https://api.github.com' + url,
        headers: { Accept: 'application/vnd.github.v3+json' },
        json: true
      };
      taunus.xhr(options, function (err, body, res) {
        next(err || res.statusCode > 399, body);
      });
    }
    function pulled (err, result) {
      if (err) {
        return;
      }
      var meta = {
        repo: repo,
        updated: datetimeService.field(new Date(result.branch.commit.commit.author.date)),
        sha: result.branch.commit.sha,
        stars: result.repo.stargazers_count
      };
      var cache = {
        date: new Date(),
        value: meta
      };
      render({ meta: meta });
      ls.set(cacheKey, cache);
    }
    function render (model) {
      var container = $.findOne('[data-repo="' + repo + '"]');
      taunus.partial(container, 'opensource/meta', model);
    }
  });
};
