'use strict';

var version = 'v7::';
var mysteryMan = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y';
var rainbows = 'https://i.imgur.com/EgwCMYB.jpg';
var env = require('../../lib/env');
var swivel = require('swivel');
var parse = require('omnibox/querystring').parse;
var sw = require('./lib/sw');
var offlineFundamentals = [
  '/',
  '/offline',
  '/css/all.css',
  '/js/all.js',
  mysteryMan,
  rainbows
];

self.addEventListener('install', installer);
self.addEventListener('activate', activator);
self.addEventListener('fetch', fetcher);

function installer (e) {
  if ('skipWaiting' in self) { self.skipWaiting(); }

  e.waitUntil(caches.open(version + 'fundamentals').then(prefill));

  function prefill (cache) {
    return cache.addAll(offlineFundamentals);
  }
}

function activator (e) {
  if ('clients' in self && self.clients.claim) { self.clients.claim(); }

  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys
        .filter(function (key) {
          return key.indexOf(version) !== 0;
        })
        .map(function (key) {
          return caches.delete(key);
        })
      );
    })
  );
}

function fetcher (e) {
  var request = e.request;
  if (request.method !== 'GET') {
    e.respondWith(fetch(request)); return;
  }

  var url = new URL(request.url);

  e.respondWith(caches.match(request).then(queriedCache));

  function queriedCache (cached) {
    var networked = fetch(request)
      .then(fetchedFromNetwork, unableToResolve)
      .catch(unableToResolve);
    return cached || networked;

    function fetchedFromNetwork (response) {
      var cacheCopy = response.clone();
      caches.open(version + 'pages').then(function add (cache) {
        cache.put(request, cacheCopy);
        relay(response, cache);
      });
      return response;
    }

    function relay (response, cache) {
      var qs = parse(url.search.slice(1));
      var loading = 'json' in qs && qs.callback === 'taunusReady';
      var json = matchesType(response, 'application/json');
      var notifies = cached && url.origin === location.origin;
      if (!notifies) {
        return;
      }
      if (json) {
        relayJSON();
      } else if (loading) {
        relayJSONP();
      }
      function relayJSON () {
        response.clone().json().then(function parsed (data) {
          swivel.broadcast('view-update', request.url, data);
        });
      }
      function relayJSONP () {
        var href = sw.toggleJSON(request.url, true);
        response.clone().text().then(function parsed (text) {
          var left = 54; // /**/ typeof taunusReady === 'function' && taunusReady(
          var right = 2; // );
          var json = text.substr(left, text.length - left - right);
          var data = JSON.parse(json);
          swivel.broadcast('view-update', href, data);
          repurpose();

          function repurpose () {
            var options = {
              status: 200,
              headers: new Headers({ 'Content-Type': 'application/json' })
            };
            cache.put(href, new Response(json, options));
          }
        });
      }
    }
  }

  function matchesType (response, type) {
    var contentType = response.headers.get('Content-Type');
    return contentType && contentType.indexOf(type) !== -1;
  }

  function unableToResolve () {
    var accepts = request.headers.get('Accept');
    if (url.origin === location.origin && accepts.indexOf('application/json') !== -1) {
      return offlineView();
    }
    if (accepts.indexOf('image') !== -1) {
      if (url.host === 'www.gravatar.com') {
        return caches.match(mysteryMan);
      }
      if (accepts.indexOf('html') === -1) {
        return caches.match(rainbows);
      }
    }
    if (url.origin === location.origin) {
      return caches.match('/offline');
    }
    return offlineResponse();
  }

  function offlineView () {
    var viewModel = {
      version: env('TAUNUS_VERSION'),
      model: { action: 'error/offline' }
    };
    var options = {
      status: 200,
      headers: new Headers({ 'Content-Type': 'application/json' })
    };
    return new Response(JSON.stringify(viewModel), options);
  }

  function offlineResponse () {
    return new Response('', { status: 503, statusText: 'Service Unavailable' });
  }
}
