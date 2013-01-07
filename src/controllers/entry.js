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
	
	getOne: function(req,res){
        var collection = models.entry,
            callback = function(err,document){
                var json = JSON.stringify(document);
				
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(json);
            },
			id = req.params.id;

        collection.findOne({ _id: id }).exec(callback);
	},

    put: function(req,res){
        var model = models.entry,
            document = req.body.entry,
			instance;

        instance = new model(document);
		instance.save(function(err){
			res.end();
		});
    },
	
	upd: function(req,res){
		var id = req.params.id,
			collection = models.entry,
            document = req.body.entry,
            done = function(err){
                res.end();
            };
		
        document.updated = new Date();
        collection.findOneAndUpdate({ _id: id }, document, {}, done);
	},

	del: function(req,res){
		var id = req.params.id;
	}
};