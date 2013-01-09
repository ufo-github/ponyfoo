var utils = require('../services/utils.js'),
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

function dateQuery(year,month,day){
    if(!!day){
        return new Date(year,month-1,day);
    }
	return {
        $gte: new Date(year, (month||1)-1, day||1),
        $lte: new Date(year, (month||12)-1, day||31)
	};
}

function dateQueryRequest(req){
    var date = dateQuery(req.params.year, req.params.month, req.params.day);

    return {
        date: date
    };
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

function single(res, query){
    var callback = function(err,document){
            resHandler(res, err, function(){
                var json = JSON.stringify({
                    entry: document
                });
                res.end(json);
            });
        };

    model.findOne(query).exec(callback);
}

module.exports = {
    get: function(req,res){
		list(res, {});
    },
	
	getByDate: function(req,res){
		var query = dateQueryRequest(req);
		list(res, query);
	},

	getBySlug: function(req,res){
        var query = dateQueryRequest(req);
        query.slug = req.params.slug;
		single(res, query);
	},

	getById: function(req,res){
        single(res, { _id: req.params.id });
	},

    put: function(req,res){
        var document = req.body,
			instance,
			callback = function(err){
                resHandler(res,err);
			};

        instance = new model(document);
        instance.slug = utils.slug(instance.title);
		instance.save(callback);
    },
	
	upd: function(req,res){
		var id = req.params.id,
            document = req.body.entry,
			callback = function(err){
                resHandler(res,err);
			};
		
        document.updated = new Date();
        document.slug = utils.slug(document.title);
        model.findOneAndUpdate({ _id: id }, document, {}, callback);
	},

	del: function(req,res){
		var id = req.params.id,
			callback = function(err){
                resHandler(res, err);
			};
			
		model.remove({ _id: id }, callback);
	}
};