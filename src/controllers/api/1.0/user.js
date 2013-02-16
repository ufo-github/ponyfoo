var mongoose = require('mongoose'),
    validation = require('../../../services/validation.js'),
    rest = require('../../../services/rest.js'),
    user = require('../../../models/user.js');

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
                    user: {
                        _id: document._id,
                        created: document.created,
                        displayName: document.displayName,
                        gravatarLarge: document.gravatarLarge,
                        website: document.website,
                        bio: document.bio,
                        passwordUndefined: document.password === undefined
                    }
                });
            }
        });
    });
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
        rules: [
            {
                all: {
                    message: 'A website needs both a title and an url',
                    rules: [
                        { field: 'website.title' },
                        { field: 'website.url' }
                    ]
                }
            }
        ]
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
    get: find,
    upd: upd
};