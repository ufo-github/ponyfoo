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
	
	get: function(req,res){
        var collection = models.entry;
		var latest = collection.find({}).sort('-date').limit(8).exec(function(err,documents){
			var json = JSON.stringify({
				documents: documents
			});
			res.end(json);
		});
	}
};