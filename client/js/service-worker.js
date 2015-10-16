'use strict';

var version = 'v2::';
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

  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key.indexOf(version) !== 0;
          })
          .map(function (key) {
            return caches.delete(keys[i]);
          })
        )
      });
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
  }

  function fetchedFromNetwork (response) {
    var clonedResponse = response.clone();
    caches.open(version + 'pages').then(function add (cache) {
      cache.put(request, clonedResponse);
    });
    return response;
  }

  function unableToResolve () {
    var accepts = request.headers.get('Accept');
    if (accepts.indexOf('image') !== -1) {
      if (url.host === 'www.gravatar.com') {
        return caches.match(mysteryMan);
      }
      return caches.match(rainbows);
    }
    if (url.origin === location.origin) {
      if (accepts.indexOf('application/json') !== -1) {
        return new Response('', { status: 0 });
      }
      return caches.match('/offline');
    }
    return new Response('', { status: 0 });
  }
}
