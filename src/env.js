'use strict';

var fs = require('fs'),
	path = require('path'),
	dotfile = path.resolve(__dirname, '../.env');

module.exports = process.env;

if(fs.existsSync(dotfile)){
	var buffer = fs.readFileSync(dotfile),
		lines = buffer.toString().split('\n');

	lines.forEach(function(line){
		var kvp = line.split('=');
		if (kvp.length !== 2){
			throw new Error('malformed .env dotfile');
		}

		module.exports[kvp[0]] = kvp[1];
	});
}