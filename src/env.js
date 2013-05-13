'use strict';

var fs = require('fs'),
	path = require('path');

function read(dotfile){
	var hash = {};

	if(fs.existsSync(dotfile)){
		var buffer = fs.readFileSync(dotfile),
			lines = buffer.toString().replace(/\r/ig,'').split('\n');

		lines.forEach(function(line){
			var kvp = line.split('=');
			if (kvp.length !== 2){
				throw new Error('malformed dotfile: ' + dotfile);
			}
			hash[kvp[0]] = kvp[1];
		});
	}
	return hash;
}

function overwrite(current, next){
	for(var key in next){
		current[key] = parse(key, next[key]);
	}
}

function parse(key, value){
	return asBoolean(key, asInteger(value));
}

function asInteger(s){
	var parsed = parseInt(s, 10),
		isInteger = !isNaN(parsed) && isFinite(s);

	return isInteger ? parsed : s;
}

function asBoolean(name, s){
	var nameRegex = /^enable|enabled$/i;
	if (nameRegex.test(name)){
		return s === 'true';
	}
	return s;
}

function parse(){
	var defaults = path.resolve(__dirname, '../.env.defaults'),
		local = path.resolve(__dirname, '../.env'),
		env = {},
		options = [
			read(defaults),
			read(local),
			process.env
		];

	for(;options.length > 0;){
		overwrite(env, options.shift());
	}

	console.log('Environment configured as: ' + env.NODE_ENV);

	return env;
}

module.exports = {
	parse: parse
};