'use strict';

var nconf = require('nconf');

nconf.use('memory');
nconf.argv();
nconf.env();

nconf.file('defaults', '.env.defaults');
nconf.file('private', '.env');

module.exports = nconf.get.bind(nconf);
