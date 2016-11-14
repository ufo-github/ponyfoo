'use strict'

const test = require(`tape`)
const sinon = require(`sinon`)
const mockery = require(`mockery`)
const routing = require(`../../controllers/routing`)

test(`routes should match expectation`, function (t) {
  const stubs = {}
  const routes = []

  setup()

  plan(`get`, `/sitemap.xml`, `./sitemap/sitemap`)

  plan(`put`, `/api/images`, `./api/images`)

  plan(`put`, `/api/articles`, `./author/only`, `./api/articles/insert`)
  plan(`patch`, `/api/articles/:slug`, `./author/only`, `./api/articles/update`)
  plan(`delete`, `/api/articles/:slug`, `./author/only`, `./api/articles/remove`)

  plan(`get`, `/account/verify-email/:token([a-f0-9]{24})`, `./account/verifyEmail`)

  plan(`get`, `/articles/feed`, `./articles/feed`)

  plan(`get`, `/`, `../../../controllers/articles/home`)
  plan(`get`, `/articles/history`, `../../../controllers/articles/history`)
  plan(`get`, `/articles/tagged/:tags`, `../../../controllers/articles/tagged`)
  plan(`get`, `/articles/search/:terms`, `../../../controllers/articles/search`)
  plan(`get`, `/articles/:year(\\d{4})/:month([01]\\d)/:day([0-3]\\d)`, `../../../controllers/articles/dated`)
  plan(`get`, `/articles/:year(\\d{4})/:month([01]\\d)`, `../../../controllers/articles/dated`)
  plan(`get`, `/articles/:year(\\d{4})`, `../../../controllers/articles/dated`)
  plan(`get`, `/articles/:slug`, `../../../controllers/articles/article`)
  plan(`get`, `/account/login`, `../../../controllers/account/login`)
  plan(`get`, `/author/compose`, `./author/only`, `../../../controllers/author/compose`)
  plan(`get`, `/author/compose/:slug`, `./author/only`, `../../../controllers/author/compose`)
  plan(`get`, `/author/review`, `./author/only`, `../../../controllers/author/review`)

  run()
  teardown()

  function setup () {
    const errors = sinon.stub()
    const transports = {
      routing: sinon.spy()
    }
    mockery.enable()
    mockery.warnOnUnregistered(false)
    mockery.registerMock(`transports`, transports)
    mockery.registerMock(`../lib/errors`, errors)
  }

  function teardown () {
    mockery.disable()
  }

  function plan () {
    // arrange
    const middleware = Array.prototype.slice.call(arguments)
    const verb = middleware.shift()
    const url = middleware.shift()

    routes.push({
      verb: verb,
      url: url,
      middleware: middleware.map(toStubs)
    })
  }

  function toStubs (key) {
    if (key && !stubs[key]) {
      stubs[key] = sinon.spy()
      mockery.registerMock(key, stubs[key])
    }
    return stubs[key]
  }

  function run () {
    // arrange
    const app = {
      get: sinon.spy(),
      put: sinon.spy(),
      post: sinon.spy(),
      patch: sinon.spy(),
      delete: sinon.spy(),
      use: sinon.spy(),
      all: sinon.spy()
    }

    // act
    routing(app)

    // assert
    t.plan(routes.reduce(count, 0))
    routes.forEach(assertRoute)

    function assertRoute (route) {
      const method = app[route.verb]
      const sets = method.args.filter(routeMatch)

      t.ok(sets.length, `route ` + route.url + ` expected at least one call`)
      t.ok(testMiddleware(), `route ` + route.url + ` expected middleware match`)

      function routeMatch (set) {
        return set[0] === route.url
      }

      function testMiddleware () {
        return sets.some(hitsEvery)
      }

      function hitsEvery (set) {
        return route.middleware.every(matches)

        function matches (middleware, i) {
          return middleware === void 0 || middleware === set[i + 1]
        }
      }
    }
  }

  function count (acc) {
    return 2 + acc
  }
})
