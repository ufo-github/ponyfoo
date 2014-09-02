'use strict';

var nconf = require('nconf');

nconf.use('memory');
nconf.argv();
nconf.env();

nconf.file('private', '.env');
nconf.file('defaults', '.env.defaults');

module.exports = nconf.get.bind(nconf);
