'use strict';

var qs = require('querystring'),
    config = require('../../../config'),
    blogService = require('../../../service/blogService.js'),
    utilityService = require('../../../service/utilityService.js');

function ensureTakenThenHydrate(req,res,next){
    var rhost = config.server.hostRegex;
    if (rhost !== undefined && !rhost.test(req.host)){
        return res.redirect(config.server2.authorityLanding + req.url, 301);
    }

    var rslug = config.server.slugRegex;
    if (rslug !== undefined && !rslug.test(req.host)){
        var statusCode = config.server.permanentRedirect ? 301 : 302;
        return res.redirect(config.server2.authorityLanding + req.url, statusCode);
    }

    blogService.findBySlug(req.slug, function(err, result){
        if(err){
            return next(err);
        }

        if(!result){
            if(config.market.on){
                var query = req.slug ? '?' + qs.stringify({ q: req.slug }) : '';
                return res.redirect(config.server2.authorityMarket + req.url + query, 302);
            }else{
                return res.redirect(config.server2.authorityLanding, 302);
            }
        }

        hydrate(req, result);
        next();
    });
}

function hydrate(req, result){
    var blog = result.blog,
        blogger = result.blogger,
        social = blog.social,
        user = req.user,
        email = social && social.email ? ' <' + social.email + '>' : '';

    req.blog = result.blog;
    req.blogger = result.blogger;

    blogger.meta = blogger.displayName + email;

    if (user){
        user.blogger = user._id.equals(blog.owner);
    }

    if (social){
        social.any = utilityService.hasTruthyProperty(social);
        social.rssXml = config.server2.authority(blog.slug) + config.feed.relative;
    }
}

module.exports = {
    ensureTakenThenHydrate: ensureTakenThenHydrate
};