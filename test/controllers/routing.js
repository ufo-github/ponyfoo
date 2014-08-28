'use strict';

var test = require('tape');
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru();

test('routes should match expectation', function (t) {
  // arrange
  var app = {
    get: sinon.spy(),
    put: sinon.spy(),
    post: sinon.spy(),
    patch: sinon.spy(),
    delete: sinon.spy(),
    use: sinon.spy()
  };
  var articleFeed = sinon.stub();
  var markdownImages = sinon.stub();
  var errors = sinon.stub();
  var transports = {
    routing: sinon.spy()
  };
  var routing = proxyquire('../../controllers/routing', {
    'transports': transports,
    '../lib/errors': errors,
    './api/markdown/images': markdownImages,
    './api/articles/feed': articleFeed
  });

  // act
  routing(app);

  // assert
  t.plan(17);
  t.ok(app.get.calledWith('/'));
  t.ok(app.put.calledWith('/api/markdown/images', markdownImages));

  t.ok(app.get.calledWith('/articles/feed', articleFeed));
  t.ok(app.get.calledWith('/articles'));
  t.ok(app.get.calledWith('/articles/archives'));
  t.ok(app.get.calledWith('/articles/:slug'));
  t.ok(app.get.calledWith('/articles/tagged/:tags'));
  t.ok(app.get.calledWith('/articles/search/:terms'));
  t.ok(app.get.calledWith('/articles/search/:terms'));
  t.ok(app.get.calledWith('/articles/:year(\\d{4})/:month([01]\\d)/:day([0-3]\\d)'));
  t.ok(app.get.calledWith('/articles/:year(\\d{4})/:month([01]\\d)'));
  t.ok(app.get.calledWith('/articles/:year(\\d{4})'));
  t.ok(app.get.calledWith('/articles/:slug'));
  t.ok(app.get.calledWith('/account/login'));
  t.ok(app.get.calledWith('/author/compose'));
  t.ok(app.get.calledWith('/author/compose/:slug'));
  t.ok(app.get.calledWith('/author/review'));
});
