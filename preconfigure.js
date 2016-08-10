'use strict';

var http = require('http');
var https = require('https');

http.globalAgent.maxSockets = 1024;
https.globalAgent.maxSockets = 1024;
