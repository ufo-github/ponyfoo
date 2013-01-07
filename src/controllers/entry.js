var mongoose = require('mongoose'),
    models = require('../models/all.js'),
	model = models.entry;
	
module.exports = {
    get: function(req,res){
        var callback = function(err,documents){
                var json = JSON.stringify({
                    entries: documents
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(json);
            };

        model.find({}).sort('-date').limit(8).exec(callback);
    },
	
	getOne: function(req,res){
        var callback = function(err,document){
                var json = JSON.stringify(document);
				
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(json);
            },
			id = req.params.id;

        model.findOne({ _id: id }).exec(callback);
	},

    put: function(req,res){
        var document = req.body.entry,
			instance;

        instance = new model(document);
		instance.save(function(err){
			res.end();
		});
    },
	
	upd: function(req,res){
		var id = req.params.id,
            document = req.body.entry,
            done = function(err){
                res.end();
            };
		
        document.updated = new Date();
        model.findOneAndUpdate({ _id: id }, document, {}, done);
	},

	del: function(req,res){
		var id = req.params.id;
			
		model.remove({ _id: id }, function(err){
			res.end();
		});
	}
};