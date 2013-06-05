'use strict';

var async = require('async'),
    mongoose = require('mongoose'),
    config = require('../config'),
    emailService = require('./emailService.js'),
    markdownService = require('./markdownService.js'),
    BlogSubscriber = require('../model/BlogSubscriber.js'),
    User = require('../model/User.js');

function subscribe(model, enabled, done){
    BlogSubscriber.find(model, function(err, subscriber){
        if(err || !!subscriber){
            return done(err);
        }

        model.enabled = enabled;
        subscriber = new BlogSubscriber(model);
        subscriber.save(function(err){
            done(err, subscriber);
        });
    });
}

function sendConfirmation(subscriber, blog, done){
    var authority = config.server.authority(blog.slug),
        model = {
        to: subscriber.email,
        subject: blog.title + ' Subscription Confirmation',
        intro: 'Please confirm your subscription to ' + blog.title,
        blog: {
            authority: authority,
            title: blog.title
        },
        confirm: {
            link: authority + '/email/confirm-subscription/' + subscriber._id
        }
    };

    emailService.send('blog_subscription_confirm', model, done);
}

function sendNotification(entry, blog, recipients, done){
    var authority = config.server.authority(blog.slug),
        model = {
        to: recipients,
        subject: entry.title,
        intro: 'The blog has been updated!',
        blog: {
            authority: authority,
            title: blog.title
        },
        entry: {
            title: entry.title,
            permalink: authority + entry.permalink,
            tags: entry.tags,
            brief : markdownService.parse(entry.brief)
        }
    };

    emailService.send('notification/blog_article', model, done);
}

module.exports = {
    subscribeUser: function(user, blog, done){
        subscribe({
            blogId: blog._id,
            userId: user._id
        }, true, done);
    },
    subscribeEmail: function(email, blog, done){
        subscribe({
            blogId: blog._id,
            email: email
        }, false, function(err, subscriber){
            if(err){
                return done(err);
            }

            sendConfirmation(subscriber, blog, done);
        });
    },
    confirmEmailSubscription: function(id, done){
        var query = { _id: mongoose.Types.ObjectId(id), enabled: false };

        BlogSubscriber.findOne(query, function(err, subscriber){
            if(err || !subscriber){
                return done(err, false);
            }

            subscriber.enabled = true;
            subscriber.save(function(err){
                done(err, subscriber);
            });
        });
    },
    notifySubscribers: function(entry, blog, done){
        BlogSubscriber.find({ blogId: blog._id }, function(err, subscribers){
            if(err){
                return done(err);
            }

            async.map(subscribers, function(subscriber, done){
                if(subscriber.email){
                    return done(null, { email: subscriber.email });
                }
                
                User.findOne({ _id: subscriber.userId }, function(err, user){
                    if(err){
                        return done(err);
                    }
                    done(null, { email: user.email });
                });
            }, function(err, recipients){
                if(err){
                    return done(err);
                }

                sendNotification(entry, blog, recipients, done);
            });
        });
    }
};