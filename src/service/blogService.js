'use strict';

var Blog = require('../model/Blog.js'),
    User = require('../model/User.js'),
    config = require('../config');

function create(owner, slug, title, done){
    new Blog({
        owner: owner._id,
        slug: slug,
        title: title,
        social: {
            rss: true
        }
    }).save(done);
}

function validate(model,done){
    var email = model['user.email'],
        password = model['user.password'],
        title = model['blog.title'];

    if(!email || !password){ // the most basic form of validation, since it's just the super admin
        return done('Oops, you should fill out every field');
    }
    if(!title){
        return done('Oops, you forgot to pick a blog title!');
    }
    done(null, {
        email: email,
        password: password,
        title: title
    });
}

function findBySlug(slug, done){
    var query = { slug: slug };

    if(!config.server2.slug.enabled){
        delete query.slug;
    }

    Blog.findOne(query).lean().exec(function(err, blog){
        if(err || !blog){
            return done(err, blog);
        }

        User.findOne({ _id: blog.owner }).lean().exec(function(err, user){
            if(err || !user){
                return done(err);
            }

            done(err, {
                blog: blog,
                blogger: user
            });
        });
    });
}

function findByUser(user, done){
    Blog.findOne({ owner: user._id }, done);
}

module.exports = {
    create: create,
    validate: validate,
    findBySlug: findBySlug,
    findByUser: findByUser
};