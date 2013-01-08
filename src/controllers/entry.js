var mongoose = require('mongoose'),
    models = require('../models/all.js'),
	model = models.entry;
	
function resHandler(res, err, success){
	res.writeHead(200, {
		'Content-Type': 'application/json',
		'Cache-Control': 'no-cache'
	});
	
	var test = !!err;		
	if (test){
		var json = JSON.stringify({
			error: {
				code: 500,
				message: 'internal server error'
			}
		});
		res.status(500);
		res.write(json);
		res.end();
	}else{
		(success || res.end)();
	}
}

function done(res, err){
	resHandler(res, err);
}
	
function list(res, query){
	var callback = function(err,documents){
		resHandler(res, err, function(){
			var json = JSON.stringify({
				entries: documents
			});
			res.end(json);
		});
	};

	model.find(query).sort('-date').exec(callback);
}

function getByDateInternal(res,year,month,day){
	var range = {
		start: new Date(year, (month||1)-1, day || 1),
		end: new Date(year, (month||12)-1, day || 31)
	};
	list(res, {
		date: {
			$gte: range.start,
			$lte: range.end
		}
	});
}

module.exports = {
    get: function(req,res){
		list(res, {});
    },
	
	getByDate: function(req,res){
		getByDateInternal(res, req.params.year, req.params.month, req.params.day);
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