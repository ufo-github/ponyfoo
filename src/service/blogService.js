'use strict';

var Blog = require('../model/Blog.js');

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

module.exports = {
    create: function (owner, slug, title, done){
        new Blog({
            owner: owner._id,
            slug: slug,
            title: title,
            social: {
                rss: true
            }
        }).save(done);
    },
    validate: validate
};