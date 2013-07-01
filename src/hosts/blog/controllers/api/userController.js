'use strict';

var mongoose = require('mongoose'),
    async = require('async'),
    api = require('../../../../config').api,
    User = require('../../../../model/User.js'),
    validation = require('../../../../service/validationService.js'),
    rest = require('../../../../service/restService.js'),
    crud = require('../../../../service/crudService.js')(User);

function list(req,res){
    crud.list({
        listName: 'users',
        limit: api.paging.limit,
        page: req.params.page,
        sort: '-created',
        mapper: function(documents, cb){
            async.map(documents, function(user, done){
                done(null, userView(user));
            }, cb);
        }
    }, rest.wrapCallback(res));
}

function find(req,res){
    var id = mongoose.Types.ObjectId(req.params.id);

    User.findOne({ _id: id }, function(err, user){
        if(err){
            rest.resHandler(err,{res:res});
            return;
        }

        rest.resHandler(err,{
            res:res,
            then: function(){
                rest.end(res,{
                    user: userView(user)
                });
            }
        });
    });
}

function userView(user){
    return {
        _id: user._id,
        created: user.created,
        displayName: user.displayName,
        gravatar: user.gravatar,
        website: user.website,
        bio: user.bio,
        passwordUndefined: user.password === undefined
    };
}

function validate(req,res){
    var source = req.body.user,
        site = source.website;

    if(site){
        if (site.url && site.url.search(/https?:\/\//i) === -1){
            site.url = 'http://' + site.url;
        }

        if(!site.title && !site.url){
            site = undefined;
        }
    }

    return validation.validate(req,res, {
        document: {
            password: source.title,
            website: site,
            bio: source.bio,
            commentNotifications: source.commentNotifications
        },
        rules: []
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

    User.findOne({ _id: id}, function(err, user){
        if(err){
            rest.resHandler(err,{res:res});
            return;
        }

        if (typeof changes.password === 'string' && changes.password.length > 0){
            user.password = changes.password;
        }

        user.website = changes.website;
        user.bio = changes.bio;
        user.commentNotifications = changes.commentNotifications;
        user.save(function (err){
            rest.resHandler(err,{res:res});
        });
    });
}

module.exports = {
    get: list,
    getById: find,
    upd: upd
};