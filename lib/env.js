'use strict';

var nconf = require('nconf');

nconf.use('memory');
nconf.argv();
nconf.env();

nconf.file('private',     './deploy/env/' + env() + '.json');
nconf.file('local',       '.env.json');
nconf.file('environment', '.env.' + env() + '.json');
nconf.file('defaults',    '.env.defaults.json');

function env () {
  return nconf.get('NODE_ENV');
}

function accessor (key, value) {
  if (arguments.length === 2) {
    return nconf.set(key, value);
  }
  return nconf.get(key);
}

function print () {
  var argv = process.argv;
  var prop = argv.length > 2 ? argv.pop() : false;
  var conf = prop ? accessor(prop) : accessor();
  console.log(JSON.stringify(conf));
}

if (module.parent) {
  module.exports = accessor;
} else {
  print();
}
