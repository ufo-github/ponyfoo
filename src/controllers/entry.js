var mongoose = require('mongoose'),
    models = require('../models/all.js');

module.exports = {
    put: function(req,res){
        var collection = models.entry,
            document = req.body.entry,
            query = { date: document.date },
            opts = { upsert: true },
            done = function(err){
                res.end();
            };

        collection.findOneAndUpdate(query, document, opts, done);
    },
	
	latest: function(req,res){
        var collection = models.entry;
		var latest = collection.find({}, function(err,documents){
			res.end(documents);
		});
	}
};