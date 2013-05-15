'use strict';

var User = require('../model/User.js');

module.exports = {
    create: function(email, password, done){
        new User({
            email: email,
            displayName: email.split('@')[0],
            password: password
        }).save(done);
    }
};