var rest = require('../../../services/rest.js'),
    text = require('../../../services/text.js'),
    models = require('../../../models/all.js'),
    crud = require('../../../services/crud.js'),
	model = models.entry;

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
        rest.resHandler(err, res, function(){
            rest.end(res,{
                entries: documents
            });
        });
    };

    model.find(query).sort('-date').exec(callback);
}

function single(res, query){
    var callback = function(err,document){
        rest.resHandler(err, res, function(){
            rest.end(res,{
                entry: document
            });
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
        crud.create(req.body,model, {
            before: function(instance){
                instance.slug = text.slug(instance.title);
            }
        });
    },

	upd: function(req,res){
		var id = req.params.id,
            document = req.body.entry,
			callback = function(err){
                rest.resHandler(err, res);
			};
		
        document.updated = new Date();
        document.slug = text.slug(document.title);
        model.findOneAndUpdate({ _id: id }, document, {}, callback);
	},

	del: function(req,res){
		var id = req.params.id,
			callback = function(err){
                rest.resHandler(err, res);
			};
			
		model.remove({ _id: id }, callback);
	}
};