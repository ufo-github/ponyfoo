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
  var article = sinon.stub();
  var home = sinon.stub();
  var author = sinon.stub();
  var view = sinon.stub();
  var errors = sinon.stub();
  var routing = proxyquire('../../controllers/routing', {
    './article_controller': article,
    './home_controller': home,
    './author_controller': author,
    './view_controller': view,
    '../lib/errors': errors
  });

  // act
  routing(app);

  // assert
  t.plan(7);
  t.ok(app.get.calledWith('/api/articles', article.list));
  t.ok(app.get.calledWith('/', home.index));
  t.ok(app.get.calledWith('/author/compose', author.only, author.compose));
  t.ok(app.get.calledWith('/*', view.render));
  t.ok(app.get.callCount, 4);
  t.ok(app.use.calledWith(errors.handler));
  t.ok(app.use.callCount, 1);
});
