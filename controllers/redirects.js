'use strict';

function setup (app) {
  app.get('/:year(\\d{4})/:month([01]\\d)/:day([0-3]\\d)/:slug', redirect('/articles/:slug'));
  app.get('/:year(\\d{4})/:month([01]\\d)/:day([0-3]\\d)', redirect('/articles/:year/:month/:day'));
  app.get('/:year(\\d{4})/:month([01]\\d)', redirect('/articles/:year/:month'));
  app.get('/:year(\\d{4})', redirect('/articles/:year'));
  app.get('/search/tagged/:tags', redirect('/articles/tagged/:tags'));
  app.get('/search/:terms', redirect('/articles/search/:terms'));
  app.get('/rss/latest.xml', redirect('/articles/feed'));
  app.get('/user/profile/:id', redirect('/'));
}

function redirect (template) {
  return function middleware (req, res, next) {
    var endpoint = Object.keys(req.params).reduce(map, template);
    res.redirect(endpoint);

    function map (endpoint, prop) {
      return endpoint.replace(':' + prop, req.params[prop]);
    }
  }
}

module.exports = {
  setup: setup
};
