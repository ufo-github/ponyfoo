'use strict';

const mongoose = require(`mongoose`);
const bodyParser = require(`body-parser`);
const cookieParser = require(`cookie-parser`);
const session = require(`express-session`);
const flash = require(`connect-flash`);
const compression = require(`compression`);
const passport = require(`passport`);
const serveStatic = require(`serve-static`);
const MongoStore = require(`connect-mongo`)(session);
const RedisStore = require(`connect-redis`)(session);
const csp = require(`helmet-csp`);
const frameguard = require(`frameguard`);
const xssFilter = require(`x-xss-protection`);
const env = require(`./env`);
const redis = require(`./redis`);
const webhooks = require(`./webhooks`);
const authentication = require(`./authentication`);
const oreillyService = require(`../services/oreilly`);
const slackFrame = require(`./slackFrame`);
const slackFrameUrl = env(`SLACK_FRAME_URL`);
const authority = env(`AUTHORITY`);
const cookieSecret = env(`COOKIE_SECRET`);
const sessionSecret = env(`SESSION_SECRET`);
const reportUri = authority + `/api/csp-report`;
const year = 1000 * 60 * 60 * 24 * 12;

function sessionStore () {
  return redis.enabled ? usingRedis() : usingMongo();

  function usingRedis () {
    return new RedisStore({
      client: redis.pub,
      ttl: year,
      prefix: `sid:`
    });
  }
  function usingMongo () {
    return new MongoStore({
      mongooseConnection: mongoose.connection
    });
  }
}

module.exports = function (app) {
  webhooks(app);
  app.locals.settings[`x-powered-by`] = false;
  app.set(`etag`, true);
  app.use(compression());
  app.use(bodyParser.json({ limit: `5mb` }));
  app.use(bodyParser.urlencoded({ limit: `5mb`, extended: false }));
  app.use(cookieParser(cookieSecret));
  app.use(session({
    name: `sid`,
    secret: sessionSecret,
    cookie: { maxAge: year },
    store: sessionStore(),
    resave: true,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());
  app.use(csp({
    reportUri: reportUri,
    reportOnly: true
  }));
  app.use(frameguard(`sameorigin`));
  app.use(xssFilter());
  app.use(slackFrameUrl, slackFrame());
  authentication.initialize();
  oreillyService.findSlugsSync().forEach(slug => {
    app.use(`/books/${slug}/img`, serveStatic(`dat/oreilly-books/${slug}/html/images`));
  });
};
