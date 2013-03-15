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

function claimValidation(req,res,next){
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

        if(!req.user){ // users must be connected to claim a blog
            return next();
        }

        blog.findOne({ owner: req.user._id }, function(err, document){
            if(err){
                throw err;
            }
            if(document !== null){ // users can own a single blog at most
                return flashValidation(req,res,'You already own a blog!');
            }

            blog.findOne({ slug: slug }, function(err, document){
                if(document !== null){
                    return flashValidation(req,res,'This blog already has an owner!');
                }
                create(req,res);
            });
        });
    }
}

function awaken(req,res){
    var email = req.body['user.email'],
        password = req.body['user.password'],
        title = req.body['blog.title'],
        document;

    if(!email || !password){ // the most basic form of validation, since it's just the super admin
        return flashValidation(req,res,'Oops, you should fill out every field');
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
        create(req,res,user);
    });
}

function create(req,res,user){
    var owner = user || req.user,
        slug = logic.getSlug(req),
        title = req.body['blog.title'];

    if(!title){
        return flashValidation(req,res,'Oops, you forgot to pick a blog title!');
    }

    new blog({
        owner: owner._id,
        slug: slug,
        title: title,
        social: {
            rss: true
        }
    }).save(function(){
        logic.live = true;
        res.redirect('/');
    });
}

function flashValidation(req,res,message){
    req.flash('validation', message);
    res.redirect('/');
}

module.exports = {
    update: update,
    claim: claimValidation
};