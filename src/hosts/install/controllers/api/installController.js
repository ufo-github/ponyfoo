'use strict';

var base = '../../../..',
    config = require(base + '/config'),
    platformService = require(base + '/service/platformService.js'),
    blogService = require(base + '/service/blogService.js'),
    userService = require(base + '/service/userService.js');

module.exports = {
    postInstall: function(req, res){
        blogService.validate(req.body, function(err, model){
            if(err){
                return done(err);
            }

            userService.create(model.email, model.password, function(err, user){
                if(err){
                    return done(err);
                }

                req.login(user, function(err){
                    if(err){
                        return done(err);
                    }
                    
                    blogService.create(user, config.server.defaultBlog, model.title, done);
                });
            });
        });

        function done(err){
            if(err){
                req.flash('validation', err);
                return res.redirect('/');
            }

            platformService.updateInstalled(function(err, installed){
                if(installed){
                    console.log('Installed. Turning off installation vhost.');
                    req.vhost.shutdown();
                }
                res.redirect('/');
            });
        }
    }
};