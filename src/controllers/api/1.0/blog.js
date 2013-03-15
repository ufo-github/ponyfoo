'use strict';

var config = require('../../../config.js'),
    logic = require('../../../logic/blog.js'),
    blog = require('../../../models/blog.js'),
    crud = require('../../../services/crud.js')(blog),
    validate = require('./blog-validation.js').validate,
    user = require('../../../models/user.js'),
    rest = require('../../../services/rest.js');

function update(req,res){
    var document = validate(req,res);
    if (document === undefined){
        return;
    }

    crud.update({ _id: req.blog._id }, document, {
        res: res
    });
}

function claim(req,res,next){
    if(logic.dormant){ // dormant
        awaken(req,res,next);
    }else if(!config.server.slugged){
        return next(); // claiming is disabled
    }else{ // attempt to claim
        var slug = logic.getSlug(req),
            slugTest = config.server.slugRegex;

        if(slugTest !== undefined && !slugTest.test(slug)){
            return next(); // this slug is an alias of the main blog.
        }

        blog.findOne({ slug: slug }, function(err, document){
            if(document !== null){
                return next(); // this blog is taken, can no longer be claimed.
            }else{ // allow the user to grab the blog
                // TODO: handle POST claim requests, validate req.user (or create from req.body), only one blog per user account
            }
        });
    }
}


function awaken(req,res){
    var email = req.body['user.email'],
        password = req.body['user.password'],
        title = req.body['blog.title'],
        document;

    if(!email || !password || !title){ // the most basic form of validation, since it's just the super admin
        req.flash('validation', 'Oops, you should fill out every field');
        res.redirect('/');
        return;
    }

    document = new user({
        email: email,
        displayName: email.split('@')[0],
        password: password
    });
    document.save(function then(err,user){
        if(err){
            throw err;
        }

        new blog({
            owner: user._id,
            slug: logic.getSlug(req),
            title: title,
            social: {
                rss: true
            }
        }).save(function(){
            logic.live = true;
            res.redirect('/');
        });
    });
}

module.exports = {
    update: update,
    claim: claim
};