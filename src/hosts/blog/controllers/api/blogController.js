'use strict';

var config = require('../../../../config'),
    Blog = require('../../../../model/Blog.js'),
    User = require('../../../../model/User.js'),
    crud = require('../../../../service/crudService.js')(Blog),
    validate = require('../../../../service/blogValidationService.js').validate,
    rest = require('../../../../service/restService.js');

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
    if(!config.server2.slug.enabled){
        return next(); // claiming is disabled
    }

    // attempt to claim
    var slug = req.slug,
        rblog = config.server2.rblog;

    if (rblog && !rblog.test(slug)){
        return next(); // this slug is an alias of the main blog.
    }

    if(!req.user){ // users must be connected to claim a blog
        return next();
    }

    Blog.findOne({ owner: req.user._id }, function(err, document){
        if(err){
            throw err;
        }
        if(document !== null){ // users can own a single blog at most
            return flashValidation(req,res,'You already own a blog!');
        }
        if(!isValid(req,res)){
            return;
        }

        Blog.findOne({ slug: slug }, function(err, document){
            if(document !== null){
                return flashValidation(req,res,'This blog already has an owner!');
            }
            create(req,res);
        });
    });
}

function isValid(req,res,isAwakening){
    var email = req.body['user.email'],
        password = req.body['user.password'],
        title = req.body['blog.title'];

    if(isAwakening && !email || !password){ // the most basic form of validation, since it's just the super admin
        return flashValidation(req,res,'Oops, you should fill out every field');
    }
    if(!title){
        return flashValidation(req,res,'Oops, you forgot to pick a blog title!');
    }
    return true;
}
function awaken(req,res){
    var email = req.body['user.email'],
        password = req.body['user.password'],
        title = req.body['blog.title'];

    if(!isValid(req,res,true)){
        return;
    }

    new User({
        email: email,
        displayName: email.split('@')[0],
        password: password
    }).save(function then(err,user){
        if(err){
            throw err;
        }
        req.login(user,function(err){
            if(err){
                throw err;
            }
            
            create(req,res,{
                user: user,
                slug: config.server2.slug.blog
            });
        });
    });
}

function create(req,res,opts){
    var o = opts || {},
        owner = o.user || req.user,
        slug = o.slug || req.slug,
        title = req.body['blog.title'];

    new Blog({
        owner: owner._id,
        slug: slug,
        title: title,
        social: {
            rss: true
        }
    }).save(function(){
        var host = config.server2.authority(slug);
        res.redirect(host);
    });
}

function flashValidation(req,res,message){
    req.flash('validation', message);
    res.redirect('/');
}

function forbidden(res){
    rest.end(res,{
        status: 'forbidden'
    });
}

function market(req,res,next){
    if(req.blogStatus !== 'market'){
        return next();
    }

    var slug = req.body.slug;
    if(!slug || typeof slug !== 'string'){
        return forbidden(res);
    }

    if(slug === config.server2.slug.market){
        return forbidden(res);
    }

    if(!/^[a-z0-9][a-z0-9\-]{1,}[a-z0-9]$/i.test(slug)){
        return forbidden(res);
    }

    var rblog = config.server2.rblog;
    if (rblog !== undefined && !rblog.test(slug)){
        return forbidden(res);
    }

    Blog.count({ slug: slug }, function(err,count){
        if(err){
            throw err;
        }

        rest.end(res,{
            status: count === 0 ? 'available' : 'taken'
        });
    });
}

module.exports = {
    update: update,
    claim: claimValidation,
    market: market
};