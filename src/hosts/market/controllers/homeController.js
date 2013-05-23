'use strict';

var userService = require('../../../service/userService.js');

function getProfile(user, done){
    if(!user){
        return process.nextTick(function(){
            done(null, 'anon');
        });
    }

    userService.hasBlog(user, function(err, hasOne){
        done(null, hasOne ? 'blogger' : 'registered');
    });
}

module.exports = {
    getIndex: function(req, res, next){
        getProfile(req.user, function(err, profile){
            if(err){
                return next(err);
            }

            console.log('TODO: Use profile: ' + profile);
            res.render('home/index.jade', {
                profile: 'all'
            });
        });
    }
};