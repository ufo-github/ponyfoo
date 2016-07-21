'use strict';

if (!module.parent) {
  require('../preconfigure');
  require('../chdir');
}

var mongoUri = require('mongodb-uri');
var env = require('../lib/env');
var uri = env('MONGO_URI');
var parts = mongoUri.parse(uri);

parts.hosts.forEach(host => {
  var port = host.port ? `:${host.port}` : '';
  host.hostname = host.host + port;
});

if (!parts.username) { parts.username = ''; }
if (!parts.password) { parts.password = ''; }

if (module.parent) {
  module.exports = parts;
} else {
  print();
}

function print () {
  var json = JSON.stringify(parts, null, 2);
  console.log(json);
}
