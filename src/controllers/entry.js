var mongoose = require('mongoose'),
    models = require('../models/all.js'),
	model = models.entry,
	resHandler = function(err, success){
		res.writeHead(200, { 'Content-Type': 'application/json' });
		
		var test = !!err;		
		if (test){
			var json = JSON.stringify({
				error: true
			});
			res.write(json);
			res.end();
		}else{
			(success || res.end)();
		}
	},
	done = function(err){
		resHandler(err);
	};
	
module.exports = {
    get: function(req,res){
        var callback = function(err,documents){
			resHandler(err, function(){
                var json = JSON.stringify({
                    entries: documents
                });
                res.end(json);
            });
		};

        model.find({}).sort('-date').limit(8).exec(callback);
    },
	
	getOne: function(req,res){
        var id = req.params.id,
			callback = function(err,document){
                resHandler(err, function(){
					var json = JSON.stringify(document);
					res.end(json);
				});
			};

        model.findOne({ _id: id }).exec(callback);
	},

    put: function(req,res){
        var document = req.body.entry,
			instance;

        instance = new model(document);
		instance.save(done);
    },
	
	upd: function(req,res){
		var id = req.params.id,
            document = req.body.entry;
		
        document.updated = new Date();
        model.findOneAndUpdate({ _id: id }, document, {}, done);
	},

	del: function(req,res){
		var id = req.params.id;
			
		model.remove({ _id: id }, done);
	}
};