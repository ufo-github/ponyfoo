'use strict';

var test = require('tape');
var sinon = require('sinon');
var proxyquire = require('proxyquire');

test('routes should match expectation', function (t) {
  // arrange
  var app = {
    get: sinon.spy()
  };
  var article = sinon.stub();
  var routing = proxyquire('../../controllers/routing', {
    './article_controller': article
  });

  // act
  routing(app);

  // assert
  t.plan(1);
  t.ok(app.get.calledWith('/api/articles', article.getList));
});
