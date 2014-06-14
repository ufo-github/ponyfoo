'use strict';

var test = require('tape');
var sinon = require('sinon');
var proxyquire = require('proxyquire');

test('routes should match expectation', function (t) {
  // arrange
  var app = {
    get: sinon.spy(),
    put: sinon.spy(),
    post: sinon.spy(),
    use: sinon.spy()
  };
  var list = sinon.stub();
  var images = sinon.stub();
  var errors = sinon.stub();
  var routing = proxyquire('../../controllers/routing', {
    './api/markdown/images': images,
    './api/article/list': list,
    '../lib/errors': errors
  });

  // act
  routing(app);

  // assert
  t.plan(6);
  t.ok(app.put.calledWith('/api/markdown/images', images));
  t.ok(app.get.calledWith('/api/articles', list));
  t.ok(app.get.calledWith('/'));
  t.ok(app.get.calledWith('/account/login'));
  t.ok(app.get.calledWith('/author/compose'));
  t.ok(app.use.calledWith(errors.handler));
});
