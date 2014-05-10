'use strict';

var path = require('path');
var nconf = require('nconf');

nconf.use('memory');
nconf.argv();
nconf.env();

nconf.file('defaults', path.resolve(__dirname, '../.env.defaults'));

module.exports = nconf.get.bind(nconf);
