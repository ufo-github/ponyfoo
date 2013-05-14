var config = require('../config.js'),
	express = require('express'),
	server = express(),
	vhosting = require('../common/vhosting.js'),
	vhost = vhosting(config.server.slugMarket, server),
	path = require('path'),
	views = path.join(__dirname, '/views');

vhost.configure(views);

module.exports = vhost; // export the middleware