'use strict';

var User = require('../model/User.js'),
    blogService = require('./blogService.js');

function getModel(email, password, encryptPassword){
    return {
        email: email,
        password: password,
        passwordEncryption: encryptPassword,
        displayName: email.split('@')[0]
    };
}

function create(encryptPassword){
    return function(email, password, done){
        var model = getModel(email,password,encryptPassword),
            user = new User(model);

        user.save(function(err){
            done(err, user);
        });
    };
}

module.exports = {
    findOne: function(query, done){
        User.findOne(query, done);
    },
    create: create(true),
    createUsingEncryptedPassword: create(false),
    hasBlog: function(user, done){
        blogService.findByUser(user, function(err, blog){
            done(err, !!blog);
        });
    },
    setPassword: function(userId, password, done){
        User.findOne({ _id: userId }, function(err, user){
            if(err || !user){
                return done(err, false);
            }

            user.password = password;
            user.save(done);
        });
    }
};