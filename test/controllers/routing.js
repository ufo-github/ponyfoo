'use strict';

var test = require('tape');
var sinon = require('sinon');
var path = require('path');
var util = require('util');
var mockery = require('mockery');

test('routes should match expectation', function (t) {
  var stubs = {};
  var routes = [];

  setup();

  plan('get', '/sitemap.xml', './sitemap/sitemap');

  plan('put', '/api/markdown/images', './api/markdown/images');

  plan('get', '/api/articles', './author/only', './api/articles/list');
  plan('put', '/api/articles', './author/only', './api/articles/insert');
  plan('patch', '/api/articles/:slug', './author/only', './api/articles/update');
  plan('delete', '/api/articles/:slug', './author/only', './api/articles/remove');
  plan('post', '/api/articles/compute-relationships', './author/only', './api/articles/compute');

  plan('get', '/account/verify-email/:token([a-f0-9]{24})', './account/verifyEmail');

  plan('get', '/articles/feed', './articles/feed');

  plan('get', '/', '../../../controllers/articles/home');
  plan('get', '/articles', '../../../controllers/articles/redirectHome');
  plan('get', '/articles/archives', '../../../controllers/articles/archives');
  plan('get', '/articles/tagged/:tags', '../../../controllers/articles/tagged');
  plan('get', '/articles/search/:terms', '../../../controllers/articles/search');
  plan('get', '/articles/:year(\\d{4})/:month([01]\\d)/:day([0-3]\\d)', '../../../controllers/articles/dated');
  plan('get', '/articles/:year(\\d{4})/:month([01]\\d)', '../../../controllers/articles/dated');
  plan('get', '/articles/:year(\\d{4})', '../../../controllers/articles/dated');
  plan('get', '/articles/:slug', '../../../controllers/articles/article');
  plan('get', '/account/login', '../../../controllers/account/login');
  plan('get', '/author/compose', './author/only', '../../../controllers/author/compose');
  plan('get', '/author/compose/:slug', './author/only', '../../../controllers/author/compose');
  plan('get', '/author/review', './author/only', '../../../controllers/author/review');

  run();
  teardown();

  function setup () {
    var errors = sinon.stub();
    var transports = {
      routing: sinon.spy()
    };
    mockery.enable();
    mockery.registerMock('transports', transports);
    mockery.registerMock('../lib/errors', sinon.stub());
  }

  function teardown () {
    mockery.disable();
  }

  function plan () {
    // arrange
    var middleware = Array.prototype.slice.call(arguments);
    var verb = middleware.shift();
    var url = middleware.shift();

    routes.push({
      verb: verb,
      url: url,
      middleware: middleware.map(toStubs)
    });
  }

  function toStubs (key) {
    if (!stubs[key]) {
      stubs[key] = sinon.spy();
      mockery.registerMock(key, stubs[key]);
    }
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

    var routing = require('../../controllers/routing');

    // act
    routing(app);

    // assert
    t.plan(routes.reduce(count, 0));
    routes.forEach(assertRoute);

    function assertRoute (route) {
      var method = app[route.verb];
      var sets = method.args.filter(routeMatch);

      t.ok(sets.length, 'route ' + route.url + ' expected at least one call');
      t.ok(testMiddleware(), 'route ' + route.url + ' expected middleware match');

      function routeMatch (set) {
        return set[0] === route.url;
      }

      function testMiddleware () {
        return sets.some(hitsEvery);
      }

      function hitsEvery (set) {
        return route.middleware.every(matches);

        function matches (middleware, i) {
          return set[i + 1] === middleware;
        }
      }
    }
  }

  function count (acc, route) {
    return 2 + acc;
  }
});
