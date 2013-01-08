var mongoose = require('mongoose'),
    models = require('../models/all.js'),
	model = models.entry,
	resHandler = function(res, err, success){
		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache'
		});
		
		var test = !!err;		
		if (test){
			var json = JSON.stringify({
				code: 500,
				error: {
					message: 'internal server error'
				}
			});
			res.status(json.code);
			res.write(json);
			res.end();
		}else{
			(success || res.end)();
		}
	},
	done = function(res, err){
		resHandler(res, err);
	};
	
module.exports = {
    get: function(req,res){
        var callback = function(err,documents){
			resHandler(res, err, function(){
                var json = JSON.stringify({
                    entries: documents
                });
                res.end(json);
            });
		};

        model.find({}).sort('-date').limit(8).exec(callback);
    },
	
	getByYear: function(req,res){
		resHandler(res, null, function(){
			res.write('by year: ');
			res.write(req.params.year);
			res.end();
		});
	},
	
	getByMonth: function(req,res){
		resHandler(res, null, function(){
			res.write('by month: ');
			res.write(req.params.year + '/' + req.params.month);
			res.end();
		});
	},
		
	getByDay: function(req,res){
		resHandler(res, null, function(){
			res.write('by day: ');
			res.write(req.params.year + '/' + req.params.month + '/' + req.params.day);
			res.end();
		});
	},
		
	getBySlug: function(req,res){
		resHandler(res, null, function(){
			res.write('by slug: ');
			res.write(req.params.year + '/' + req.params.month + '/' + req.params.day + '/' + req.params.slug);
			res.end();
		});
	},
	
	getById: function(req,res){
        var id = req.params.id,
			callback = function(err,document){
                resHandler(res, err, function(){
					var json = JSON.stringify({
						entry: document
					});
					res.end(json);
				});
			};

        model.findOne({ _id: id }).exec(callback);
	},

    put: function(req,res){
        var document = req.body.entry,
			instance,
			callback = function(err){
				done(res,err);
			};

        instance = new model(document);
		instance.save(callback);
    },
	
	upd: function(req,res){
		var id = req.params.id,
            document = req.body.entry,
			callback = function(err){
				done(res,err);
			};
		
        document.updated = new Date();
        model.findOneAndUpdate({ _id: id }, document, {}, callback);
	},

	del: function(req,res){
		var id = req.params.id,
			callback = function(err){
				done(res,err);
			};
			
		model.remove({ _id: id }, callback);
	}
};