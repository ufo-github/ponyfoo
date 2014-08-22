'use strict';

var url = require('url');
var jsdom = require('jsdom');
var env = require('../lib/env');
var authority = env('AUTHORITY');

function absolutize (html, done) {
  jsdom.env(html, absolutize);

  function absolutize (err, window) {
    if (err) {
      done(err); return;
    }
    var doc = window.document;
    absolutizeOn(doc.querySelectorAll('a[href]'), 'href');
    absolutizeOn(doc.querySelectorAll('img[src]'), 'src');
    absolutizeOn(doc.querySelectorAll('iframe[src]'), 'src');
    absolutizeOn(doc.querySelectorAll('script[src]'), 'src');
    absolutizeOn(doc.querySelectorAll('link[href]'), 'href');
    done(null, doc.body.innerHTML);
    window.close();
  }
}

function absolutizeOn (elements, prop) {
  var i;
  var href;
  var absolute;

  for (i = 0; i < elements.length; i++) {
    href = elements[i].getAttribute(prop);
    if (href) {
      absolute = url.resolve(authority, href);
      elements[i].setAttribute(prop, absolute);
    }
  }
}

module.exports = {
  absolutize: absolutize
};
