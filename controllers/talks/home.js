'use strict';

var _ = require('lodash');
var queso = require('queso');
var assign = require('assignment');
var moment = require('moment');
var colorService = require('../../services/color');
var datetimeService = require('../../services/datetime');
var browserEnv = require('../../client/js/lib/env');
var mapsKey = browserEnv('GOOGLE_MAPS_API_KEY');
var Engagement = require('../../models/Engagement');
var pastTagMap = {
  speaking: 'spoke',
  organizing: 'organized',
  attending: 'attended'
};

function home (req, res, next) {
  getModelData(function got (err, data) {
    if (err) {
      next(err); return;
    }
    var upcoming = _.sortBy(data.engagements.filter(hasNotEnded), 'end');
    var diff = _.difference(data.engagements, upcoming);
    var past = _.sortBy(diff, 'end').reverse();
    res.viewModel = {
      model: {
        title: 'Conference Talks presented by Nicolás Bevacqua',
        engagements: {
          upcoming: upcoming.map(toEngagementModel),
          past: past.map(toEngagementModel),
          fullMap: getFullMap(data.engagements)
        },
        presentations: data.presentations
      }
    };
    next();
  });
}

function getModelData (done) {
  var presentations = [{
    slug: 'practical-es6',
    title: 'Practical ES6 for the Modern JavaScript Tinkerer',
    description: "ES6 is now a standard. We're seeing increasing adoption across the web and the fear of missing out is invading your senses. This talk will introduce you to the most practical aspects of ES6, how to use it today in production, what new features are the most useful, and how to migrate away from your ES5 lifestyle, gradually towards adoption of ES6 features. Eventually, you'll be using ES6 without even realizing you ever made \"the switch\".",
    speakerdeck: { id: '816ace8105fc40529e5d3c136b76d744', ratio: 1.33333333333333 },
    resources: [
      { title: 'Article: ES6 Overview in 350 Bullet Points', url: 'https://ponyfoo.com/articles/es6' },
      { title: 'Series: ES6 in Depth on ponyfoo.com', url: 'https://ponyfoo.com/articles/tagged/es6-in-depth' }
    ]
  }, {
    slug: 'high-performance-critical-path',
    title: 'High Performance in the Critical Path',
    description: "This talk covers the past, present and future of web application performance when it comes to delivery optimization. I'll start by glancing over what you're already doing -- minifying your static assets, bundling them together, and using progressive enhancement techniques. Then I'll move on to what you should be doing -- optimizing TCP network delivery, inlining critical CSS, deferring font loading and CSS so that you don't block the rendering path, and of course deferring JavaScript. Afterwards we'll look at the future, and what HTTP 2.0 has in store for us, going full circle and letting us forego hacks of the past like bundling and minification.",
    speakerdeck: { id: '2ea137647c734b54b37012db8a596b28', ratio: 1.33333333333333 },
    vimeo: 'https://player.vimeo.com/video/131634704',
    resources: [
      { title: 'Web Page Test', url: 'http://www.webpagetest.org/' },
      { title: 'High Performance Browser Networking', url: 'http://chimera.labs.oreilly.com/books/1230000000545' },
      { title: 'Self-guided NodeSchool <code>perfschool</code> Workshop', url: 'https://github.com/bevacqua/perfschool' },
      { title: 'JavaScript Application Design', url: '/buildfirst' },
      { title: 'Article: Let\'s talk about Web Performance', url: 'https://ponyfoo.com/articles/talk-about-web-performance' },
      { title: 'Article: Fixing Performance in the Web Stack', url: 'https://ponyfoo.com/articles/fixing-web-performance' }
    ]
  }, {
    slug: 'browserify-all-the-things',
    title: 'Browserify All The Things',
    description: "This talk is about how to use browserify to develop front-end modular code using Common.JS, and how those modules should be documented, designed, and released using an automated build system. In order to explain these concepts I'll walk you through a few of my own open-source creations, highlighting interesting points as we go along.",
    speakerdeck: { id: 'd74647f010a201324de17ae407783e32', ratio: 1.77777777777778 },
    youtube: 'https://www.youtube.com/embed/uZ_1_fddWns',
    resources: [
      { title: 'Browserify Handbook', url: 'https://github.com/substack/browserify-handbook' },
      { title: 'Task automation with <code>npm run</code>', url: 'http://substack.net/task_automation_with_npm_run' },
      { title: 'JavaScript Application Design', url: '/buildfirst' }
    ]
  }, {
    slug: 'front-end-ops-tooling',
    title: 'Front End Ops Tooling',
    description: "This talk covers build tooling, processes, and your development workflow. You’ll get a glimpse as to why you should be building, and why you should put together a build process from the get-go. Then we’ll move on to tooling. Here I’ll discuss some of the most popular JavaScript build tools, namely Grunt, Gulp, and npm. We’ll investigate how each one performs for certain tasks, and I’ll help you forge your own build sword. Lastly, I’ll discuss the benefits of going for the module format Node.js uses, which is Common.js, and how you can leverage those modules in the browser, using a tool called Browserify.",
    speakerdeck: { id: 'acbdab30c7f801316c2c42baa33a3298', ratio: 1.77777777777778 },
    youtube: 'https://www.youtube.com/embed/Y0DCZdAruvo',
    resources: [
      { title: 'Gulp, Grunt, Whatever', url: 'https://ponyfoo.com/articles/gulp-grunt-whatever' },
      { title: 'Grunt, Gulp, or <code>npm run</code>?', url: 'https://ponyfoo.com/articles/choose-grunt-gulp-or-npm' },
      { title: 'JavaScript Application Design', url: '/buildfirst' }
    ]
  }];
  Engagement.find({}).lean().exec(executed);
  function executed (err, engagements) {
    if (err) {
      done(err); return;
    }
    done(null, {
      presentations: presentations,
      engagements: engagements
    });
  }
}

function getFullMap (engagements) {
  return getMapImageUrl(engagements.map(toPlace), {
    size: '1200x300',
    style: 'all|saturation:-100'
  });
  function toPlace (engagement) {
    return {
      location: engagement.location,
      color: getMarkerColor(engagement),
      size: getMarkerSize(engagement)
    };
  }
}

function getMarkerColor (engagement) {
  var upcoming = hasNotEnded(engagement);
  var color = colorService[upcoming ? 'pink' : 'black'];
  var hex = '0x' + color;
  return hex;
}

function getMarkerSize (engagement) {
  return 'tiny';
}

function toEngagementModel (engagement, i) {
  var upcoming = hasNotEnded(engagement);
  var model = {
    range: datetimeService.range(engagement.start, engagement.end),
    conference: engagement.conference,
    website: engagement.website,
    venue: engagement.venue,
    map: {
      link: 'https://maps.google.com?q=' + encodeURIComponent(engagement.location).replace(/%20/g, '+'),
      image: getMapImageUrl([{
        location: engagement.location,
        color: getMarkerColor(engagement),
        size: getMarkerSize(engagement)
      }], { scale: 17 })
    },
    tags: engagement.tags.map(toTagText)
  };
  return model;
  function toTagText (tag) {
    return upcoming ? tag : pastTagMap[tag] || tag;
  }
}

function hasStarted (engagement) {
  return moment(engagement.start).startOf('day').isBefore(moment());
}

function hasNotEnded (engagement) {
  return moment(engagement.end).endOf('day').isAfter(moment());
}

function getMapImageUrl (places, options) {
  var base = 'https://maps.googleapis.com/maps/api/staticmap';
  var defaults = {
    scale: 2,
    size: '600x300',
    maptype: 'roadmap',
    key: mapsKey
  };
  var qs = queso.stringify(assign({}, defaults, options));
  var markers = places.reduce(getMarker, '');
  return base + qs + markers;
}

function getMarker (all, place) {
  var marker = Object.keys(place).reduce(getProps, '');
  return all + '&markers=' + encodeURIComponent(marker) + place.location;
  function getProps (props, key) {
    if (key === 'location') {
      return props;
    }
    return props + key + ':' + place[key] + '|';
  }
}

module.exports = home;
