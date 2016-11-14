'use strict'

const $ = require(`dominus`)
const taunus = require(`taunus`)
const concurrent = require(`contra/concurrent`)
const ls = require(`local-storage`)
const datetimeService = require(`../../../../services/datetime`)

module.exports = function (viewModel) {
  viewModel.projects.forEach(function (project) {
    const branch = project.branch
    const repo = project.repo
    const cacheKey = `oss:repos/` + repo
    const cache = ls.get(cacheKey)
    const earlier = new Date()
    earlier.setHours(earlier.getHours() - 6)
    if (cache && new Date(cache.date) > earlier) {
      render({ meta: cache.value })
      return
    }
    concurrent({
      repo (next) {
        query(`/repos/` + repo, next)
      },
      branch (next) {
        query(`/repos/` + repo + `/branches/` + branch, next)
      }
    }, pulled)
    function query (url, next) {
      const options = {
        url: `https://api.github.com` + url,
        headers: { Accept: `application/vnd.github.v3+json` },
        json: true
      }
      taunus.xhr(options, function (err, body, res) {
        next(err || res.statusCode > 399, body)
      })
    }
    function pulled (err, result) {
      if (err) {
        return
      }
      const meta = {
        repo: repo,
        updated: datetimeService.field(new Date(result.branch.commit.commit.author.date)),
        sha: result.branch.commit.sha,
        stars: result.repo.stargazers_count
      }
      const cache = {
        date: new Date(),
        value: meta
      }
      render({ meta: meta })
      ls.set(cacheKey, cache)
    }
    function render (model) {
      const container = $.findOne(`[data-repo="` + repo + `"]`)
      taunus.partial(container, `opensource/meta`, model)
    }
  })
}
