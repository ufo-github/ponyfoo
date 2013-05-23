'use strict';

var User = require('../model/User.js'),
    blogService = require('./blogService.js');

module.exports = {
    create: function(email, password, done){
        new User({
            email: email,
            displayName: email.split('@')[0],
            password: password
        }).save(done);
    },
    hasBlog: function(user, done){
        blogService.findByUser(user, function(err, blog){
            done(err, !!blog);
        });
    }
};