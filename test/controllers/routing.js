'use strict';

var test = require('tape');
var sinon = require('sinon');
var path = require('path');
var util = require('util');
var proxyquire = require('proxyquire').noCallThru();
var controllers = path.resolve('./controllers');

test('routes should match expectation', function (t) {
  var errors = sinon.stub();
  var transports = {
    routing: sinon.spy()
  };
  var stubs = {
    'transports': transports,
    '../lib/errors': errors
  };
  var routes = [];

  plan(false, 'get', '/sitemap.xml');

  plan(false, 'put', '/api/markdown/images', './api/markdown/images');

  plan(false, 'get', '/api/articles', './author/only', './api/articles/list');
  plan(false, 'put', '/api/articles', './author/only', './api/articles/insert');
  plan(false, 'patch', '/api/articles/:slug', './author/only', './api/articles/update');
  plan(false, 'delete', '/api/articles/:slug', './author/only', './api/articles/remove');
  plan(false, 'post', '/api/articles/compute-relationships', './author/only', './api/articles/compute');

  plan(false, 'get', '/account/verify-email/:token([a-f0-9]{24})', './account/verifyEmail');

  plan(false, 'get', '/articles/feed', './articles/feed');

  plan(true, 'get', '/', './articles/home');
  plan(true, 'get', '/articles', './articles/redirectHome');
  plan(true, 'get', '/articles/archives', './articles/archives');
  plan(true, 'get', '/articles/tagged/:tags', './articles/tagged');
  plan(true, 'get', '/articles/search/:terms', './articles/search');
  plan(true, 'get', '/articles/:year(\\d{4})/:month([01]\\d)/:day([0-3]\\d)', './articles/dated');
  plan(true, 'get', '/articles/:year(\\d{4})/:month([01]\\d)', './articles/dated');
  plan(true, 'get', '/articles/:year(\\d{4})', './articles/dated');
  plan(true, 'get', '/articles/:slug', './articles/article');
  plan(true, 'get', '/account/login', './account/login');
  plan(true, 'get', '/author/compose', './author/only', './author/compose');
  plan(true, 'get', '/author/compose/:slug', './author/only', './author/compose');
  plan(true, 'get', '/author/review', './author/only', './author/review');

  run();

  function plan () {
    // arrange
    var middleware = Array.prototype.slice.call(arguments);
    var view = middleware.shift();
    var verb = middleware.shift();
    var url = middleware.shift();

    middleware.forEach(makeStub);

    routes.push({
      view: view,
      verb: verb,
      url: url,
      middleware: middleware.map(toStubs)
    });

    function makeStub (key) {
      var location = view ? key : path.resolve('controllers', key);

      if (!stubs[key]) {
        stubs[key] = sinon.stub();
        stubs[key].location = key;
      }
    }
  }

  function toStubs (key) {
    return stubs[key];
  }

  function run () {
    // arrange
    var app = {
      get: sinon.spy(),
      put: sinon.spy(),
      post: sinon.spy(),
      patch: sinon.spy(),
      delete: sinon.spy(),
      use: sinon.spy()
    };
    var routing = proxyquire('../../controllers/routing', stubs);

    // act
    routing(app);

    // assert
    t.plan(routes.reduce(count, 0));
    routes.forEach(assertRoute);

    function assertRoute (route) {
      var method = app[route.verb];
      var sets = method.args.filter(routeMatch);
      var log = [];

      t.ok(sets.length, 'route ' + route.url + ' expected at least one call');
      t.ok(testMiddleware(), 'route ' + route.url + ' expected middleware match');

      function routeMatch (set) {
        return set[0] === route.url;
      }

      function testMiddleware () {
        var result = sets.some(hitsEvery);
        if (result === false) {
          console.log(log.map(lines).join('\n'));
        }

        function lines (logline) {
          return logline.join(' ');
        }

        function hitsEvery (set) {
          var cur = [];
          log.push(cur);
          return route.middleware.every(matches);

          function matches (middleware, i) {
            var result = set[i + 1] === middleware;
            if (result === false) {
              cur.push(set[i + 1], middleware, util.format('do not match (%s,%s)', set.length, route.middleware.length));
            }
            return result;
          }
        }
      }
    }
  }

  function count (acc, route) {
    return 1 + route.middleware.length + acc;
  }
});
