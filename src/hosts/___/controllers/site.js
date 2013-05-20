'use strict';

var config = require('../config.js'),
    logic = require('../logic/blog.js'),
    blog = require('../models/blog.js'),
    user = require('../models/user.js'),
    rest = require('../services/rest.js'),
    $ = require('../services/$.js'),
    qs = require('querystring'),
    view = require('../logic/siteViews.js');

function findBlog(req,res,done){
    if(req.slug && req.blogStatus){ // shortcut
        return done(req.blogStatus);
    }

    var slug = logic.getSlug(req);

    logic.getStatus(function(){
        var slugTest = config.server.slugRegex,
            query = { slug: slug };

        if(logic.dormant){ // platform isn't configured at all
            if (req.url !== '/' || (slug !== config.server.slugMarket && config.server.slugged)){
                return then('dormant-redirect');
            }
            return then('dormant');
        }

        if(!config.server.slugged){
            delete query.slug;
        }else if(slug === config.server.slugMarket){
            return then('market');
        }else if(slugTest !== undefined && !slugTest.test(slug) && slug !== config.server.slugMarket){
            return then('slug-redirect');
        }

        // the website is live and the blog might be user-defined (or available)
        lookupBlog(req,query,then);
    });

    function then(status){
        req.slug = slug;
        req.blogStatus = status;
        done(status);
    }
}

function lookupBlog(req,query,then){
    blog.findOne(query).lean().exec(function(err, document){
        if(document !== null){ // this is the blog we're going to use
            user.findOne({ _id: document.owner }).lean().exec(function(err, user){
                if(err){
                    throw err;
                }
                req.blog = document;
                req.blogger = user;
                appendBlogInfo(req);
                return then('blog');
            });
        }else{ // allow the user to grab the blog
            return then('available');
        }
    });
}

function appendBlogInfo(req){
    var blog = req.blog,
        social = blog.social,
        blogger = req.blogger,
        user = req.user,
        email = social && social.email ? ' <' + social.email + '>' : '';

    blogger.meta = blogger.displayName + email;

    if (user){
        user.blogger = user._id.equals(blog.owner);
    }
    if (social){
        social.any = $.hasTruthyProperty(social);
        social.rssXml = config.server.hostSlug(blog.slug) + config.feed.relative;
    }
}

function locateView(req,res){
    findBlog(req,res,function(status){
        switch(status){
            case 'dormant-redirect': // not 301 because the slug can be awaken
                return res.redirect(config.server.host);
            case 'slug-redirect': // this slug is forbidden, redirect to the default blog.
                var statusCode = config.server.permanentRedirect ? 301 : 302;
                return res.redirect(config.server.host + req.url, statusCode);
            case 'available':
                var query = req.slug ? '?' + qs.stringify({ q: req.slug }) : '';
                return res.redirect(config.server.host + query);
            default: // 'dormant', 'market', and 'blog'
                req.blog = req.blog || status;
                return view.render(req,res);
        }
    });
}

function hostValidation(req,res,next){
    var val = config.server.hostRegex;
    if (val !== undefined && !val.test(req.host)){
        return res.redirect(config.server.host + req.url, 301);
    }

    // crucial: appends blog, blogStatus and blogger to the request.
    findBlog(req,res,function(){
        next();
    });
}

module.exports = {
    hostValidation: hostValidation,
    get: locateView
};