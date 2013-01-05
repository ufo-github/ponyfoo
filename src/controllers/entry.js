var mongoose = require('mongoose'),
    models = require('../models/all.js');

module.exports = {
    get: function(req,res){
        var collection = models.entry,
            callback = function(err,documents){
                var json = JSON.stringify({
                    entries: documents
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(json);
            };

        collection.find({}).sort('-date').limit(8).exec(callback);
    },

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

	del: function(req,res){
		console.log(req.body.id);
	}
};