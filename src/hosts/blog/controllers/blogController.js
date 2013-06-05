'use strict';

var async = require('async'),
    qs = require('querystring'),
    config = require('../../../config'),
    blogService = require('../../../service/blogService.js'),
    blogSubscriptionService = require('../../../service/blogSubscriptionService.js'),
    utilityService = require('../../../service/utilityService.js');

function ensureTakenThenHydrate(req,res,next){
    var rtld = config.server.rtld;
    if (rtld && !rtld.test(req.host)){
        return res.redirect(config.server.authorityLanding + req.url, 301);
    }

    blogService.findBySlug(req.slug, function(err, result){
        if(err){
            return next(err);
        }

        if(!result){
            var queryPart = req.slug ? '?' + qs.stringify({ q: req.slug }) : '',
                query = config.market.on ? queryPart : '';

            return res.redirect(config.server.authorityLanding + query, 302);
        }

        hydrate(req, result, next);
    });
}

function hydrate(req, model, done){
    async.waterfall([
        function(next){
            var social = model.blog.social,
                email = social && social.email ? ' <' + social.email + '>' : '';

            req.blog = model.blog;
            req.blogger = model.blogger;
            req.blogger.meta = req.blogger.displayName + email;

            if (social){
                social.any = utilityService.hasTruthyProperty(social);
                social.rssXml = config.server.authority(req.blog.slug) + config.feed.relative;
            }

            next(null, req.user);
        },
        function(user, next){
            if(!user){
                return next();
            }

            user.blogger = user._id.equals(req.blog.owner);

            if (user.blogger){
                user.subscribed = true;
                return next();
            }
            
            blogSubscriptionService.isSubscriber(user, function(err, isSubscriber){
                if(err){
                    next(err);
                }
                user.subscribed = isSubscriber;
                next();
            });
        }
    ], done);
}

module.exports = {
    ensureTakenThenHydrate: ensureTakenThenHydrate
};