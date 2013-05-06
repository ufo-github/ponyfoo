'use strict';

var Log = require('../models/Log.js'),
	config = require('../config.js'),
	min = 10,
	levels = {
		DEBUG: min,
		INFO: 20,
		WARN: 30,
		ERROR: 40,
		FATAL: 50
	},
	threshold = getLevel();

function getLevel(){
	var level = config.logging.level,
		value = levels[level.toUpperCase()] || levels.DEBUG;

	return value || min;
}

function write(level){
	if(threshold < levels[level]){
		return function() {};
	}

	return  function(message, err, done) {
		var log = new Log({
			level: level,
			message: message,
			exception: err instanceof Error ? err.stack : err
		});

		log.save(done);
	};
}

module.exports = {
	debug: write('DEBUG'),
	info: write('INFO'),
	warn: write('WARN'),
	error: write('ERROR'),
	fatal: write('FATAL')
};