'use strict';

var Blog = require('../models/Blog');
var User = require('../models/User');

function create (owner, slug, title, done) {
  new Blog({
    owner: owner._id,
    slug: slug,
    title: title,
    social: {
      rss: true
    }
  }).save(done);
}

function validate (model,done) {
  var email = model['user.email'],
    password = model['user.password'],
    title = model['blog.title'];

  if(!email || !password) { // the most basic form of validation, since it's just the super admin
    return done('Oops, you should fill out every field');
  }
  if(!title) {
    done('Oops, you forgot to pick a blog title!'); return;
  }
  done(null, {
    email: email,
    password: password,
    title: title
  });
}

function findBySlug (slug, done) {
  Blog.findOne({ slug: slug }).lean().exec(foundBlog);

  function foundBlog (err, blog) {
    if (err || !blog) {
      done(err); return;
    }

    User.findOne({ _id: blog.owner }).lean().exec(foundUser);

    function foundUser (err, user) {
      if (err || !user) {
        done(err); return;
      }

      done(err, { blog: blog, blogger: user });
    }
  }
}

function findByUser (user, done) {
  Blog.findOne({ owner: user._id }, done);
}

function findById (id, done) {
  Blog.findOne({ _id: id }, done);
}

module.exports = {
  create: create,
  validate: validate,
  findById: findById,
  findBySlug: findBySlug,
  findByUser: findByUser
};
