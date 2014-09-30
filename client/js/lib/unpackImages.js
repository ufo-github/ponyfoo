'use strict';

var dataUriTest = require('./dataUriTest');

function unpackImages (measly, collection) {
  var images = collection.where('[data-src]');
  var sources = images.map(datasource);
  if (sources.length > 2) {
    dataUriTest(bundled, raw);
  } else {
    raw();
  }

  function bundled () {
    var data = {
      json: { resources: sources }, timeout: 15000
    };
    measly.post('/api/unpack-images', data).on('data', repack);
  }

  function raw () {
    repack({ images: {} });
  }

  function repack (data) {
    images.forEach(assign);

    function assign (img, i) {
      var source = sources[i];
      var datauri = data.images[source];
      if (datauri) {
        img.src = datauri;
      } else {
        img.src = source;
      }
    }
  }
}

function datasource (img) {
  var source = img.getAttribute('data-src');
  img.removeAttribute('data-src');
  return source;
}

module.exports = unpackImages;
