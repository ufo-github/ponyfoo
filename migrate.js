'use strict';

var argv = require('mimist').parse(process.argv);
var mongoose = require('mongoose');
var sourceConnection = argv.source;
var source = mongoose.createConnection(sourceConnection);

// get source articles
// map into Article
// pull into target
