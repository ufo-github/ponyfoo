'use strict';

var version = 'v1::';
var mysteryMan = 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y';
var rainbows = 'https://i.imgur.com/EgwCMYB.jpg';
var offlineFundamentals = [
  '/',
  '/offline',
  '/css/all.css',
  '/js/all.js',
  mysteryMan,
  rainbows
];
var serviceUnavailable = 503;

self.addEventListener('install', installer);
self.addEventListener('activate', activator);
self.addEventListener('fetch', fetcher);

function installer (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(version + 'fundamentals').then(prefill));

  function prefill (cache) {
    return cache.addAll(offlineFundamentals);
  }
}

function activator (e) {
  if ('clients' in self && clients.claim) { clients.claim(); }
}

function fetcher (e) {
  var url = new URL(e.request.url);

  e.respondWith(caches.match(e.request).then(queriedCache));

  function queriedCache (cached) {
    return cached || fetch(e.request)
      .then(fetchedFromNetwork)
      .catch(unableToResolve);
  }

  function fetchedFromNetwork (response) {
    var clonedResponse = response.clone();
    caches.open(version + 'pages').then(function add (cache) {
      cache.put(e.request, clonedResponse);
    });
    return response;
  }

  function unableToResolve () {
    var accepts = e.request.headers.get('Accept');
    if (accepts.indexOf('image') !== -1) {
      if (url.host === 'www.gravatar.com') {
        return caches.match(mysteryMan);
      }
      if (url.host === 'i.imgur.com') {
        return caches.match(rainbows);
      }
    }
    if (accepts.indexOf('application/json') !== -1) {
      return new Response('{}', { // so rough, but also *actually* good enough.
        status: serviceUnavailable,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    return caches.match('/offline');
  }
}
