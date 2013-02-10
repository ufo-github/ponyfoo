var mongoose = require('mongoose'),
    rest = require('../../../services/rest.js'),
    user = require('../../../models/user.js');

function get(req,res){
    var id = mongoose.Types.ObjectId(req.params.id);

    user.findOne({ _id: id}, function(err, document){
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

function upd(req,res){
    var id = mongoose.Types.ObjectId(req.params.id);
    if(!id.equals(req.user._id)){
        rest.unauthorized(req,res);
        return;
    }

    user.findOne({ _id: id}, function(err, document){
        if(err){
            rest.resHandler(err,{res:res});
            return;
        }

        var changes = req.body.user;
        if (typeof changes.password === 'string' && changes.password.length > 0){
            document.password = changes.password;
        }

        document.website = changes.website;

        if(typeof document.website.url === 'string' && document.website.url.search(/https?:\/\//i) === -1){
            document.website.url = 'http://' + document.website.url;
        }

        document.bio = changes.bio;
        document.save(function (err){
            rest.resHandler(err,{res:res});
        });
    });
}

module.exports = {
    get: get,
    upd: upd
};