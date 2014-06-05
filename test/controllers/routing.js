'use strict';

var test = require('tape');
var sinon = require('sinon');
var proxyquire = require('proxyquire');

test('routes should match expectation', function (t) {
  // arrange
  var app = {
    get: sinon.spy(),
    use: sinon.spy()
  };
  var list = sinon.stub();
  var errors = sinon.stub();
  var routing = proxyquire('../../controllers/routing', {
    './article/list': list,
    '../lib/errors': errors
  });

  // act
  routing(app);

  // assert
  t.plan(4);
  t.ok(app.get.calledWith('/api/articles', list));
  t.equal(app.get.callCount, 3);
  t.ok(app.use.calledWith(errors.handler));
  t.equal(app.use.callCount, 1);
});
