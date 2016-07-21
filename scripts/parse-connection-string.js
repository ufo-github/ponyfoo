'use strict';

require('../preconfigure');
require('../chdir');

var mongoUri = require('mongodb-uri');
var env = require('../lib/env');
var uri = env('MONGO_URI');
var parts = mongoUri.parse(uri);

parts.hosts.forEach(host =>
  host.hostname = host.host + (host.port ? `:${host.port}` : '')
);

if (!parts.username) { parts.username = ''; }
if (!parts.password) { parts.password = ''; }

var json = JSON.stringify(parts, null, 2);

console.log(json);
