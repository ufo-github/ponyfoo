var mongoose = require('mongoose'),
    async = require('async'),
    apiConf = require('../config.js'),
    validation = require('../../../services/validation.js'),
    rest = require('../../../services/rest.js'),
    user = require('../../../models/user.js'),
    crud = require('../../../services/crud.js')(user);

function list(req,res){
    crud.list({
        listName: 'users',
        limit: apiConf.paging.limit,
        page: req.params.page,
        sort: '-created',
        mapper: function(documents, cb){
            async.map(documents, function(document, done){
                done(null, userView(document));
            }, cb);
        }
    }, rest.wrapCallback(res));
}

function find(req,res){
    var id = mongoose.Types.ObjectId(req.params.id);

    user.findOne({ _id: id }, function(err, document){
        if(err){
            rest.resHandler(err,{res:res});
            return;
        }

        rest.resHandler(err,{
            res:res,
            then: function(){
                rest.end(res,{
                    user: userView(document)
                });
            }
        });
    });
}

function userView(document){
    return {
        _id: document._id,
        created: document.created,
        displayName: document.displayName,
        gravatar: document.gravatar,
        website: document.website,
        bio: document.bio,
        passwordUndefined: document.password === undefined
    };
}

function validate(req,res){
    var source = req.body.user,
        site = source.website;

    if(!!site && !!site.url && site.url.search(/https?:\/\//i) === -1){
        site.url = 'http://' + site.url;
    }

    return validation.validate(req,res, {
        document: {
            password: source.title,
            website: site,
            bio: source.bio
        },
        rules: [{
            all: {
                message: 'A website needs both a title and a url',
                rules: [
                    { field: 'website.title', length: { max: 35 } },
                    { field: 'website.url', length: { max: 400 } }
                    // TODO: allow website url/title to be both empty or both valid
                ]
            }
        }]
    });
}

function upd(req,res){
    var id = mongoose.Types.ObjectId(req.params.id);
    if(!id.equals(req.user._id)){
        rest.unauthorized(req,res);
        return;
    }

    var changes = validate(req,res);
    if (changes === undefined){
        return;
    }

    user.findOne({ _id: id}, function(err, document){
        if(err){
            rest.resHandler(err,{res:res});
            return;
        }

        if (typeof changes.password === 'string' && changes.password.length > 0){
            document.password = changes.password;
        }

        document.website = changes.website;
        document.bio = changes.bio;
        document.save(function (err){
            rest.resHandler(err,{res:res});
        });
    });
}

module.exports = {
    get: list,
    getById: find,
    upd: upd
};