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
            query = { _id: document._id },
            opts = { upsert: true },
            done = function(err){
                res.end();
            };

        if(!!document._id){
            query = { _id: document._id }
        }else{
            query = { _id: new mongoose.Types.ObjectId() }
        }
        delete document._id;
        document.updated = new Date();

        collection.findOneAndUpdate(query, document, opts, done);
    },

	del: function(req,res){
		console.log(req.body.id);
	}
};