var config = require('../config.js'),
    blog = require('../models/blog.js'),
    user = require('../models/user.js'),
    rest = require('../services/rest.js'),
    $ = require('../services/$.js'),
    pagedown = require('pagedown'),
    live;

function getStatus(done){
    if(live !== undefined){
        process.nextTick(done);
        return;
    }

    blog.count({}, function(err, count){
        live = count > 0;
        done();
    });
}

function getBlogSlug(req){
    var i = req.host.lastIndexOf('.' + config.server.tld),
        slug = req.host.substr(0, i);

    return slug;
}

function findBlogInternal(req,res,done){
    getStatus(function(){
        var slug = getBlogSlug(req),
            slugTest = config.server.slugRegex,
            query = { slug: slug };

        if(!live){ // platform isn't configured at all
            if (req.url !== '/' || slug !== config.server.slugHome){
                return then('dormant-redirect');
            }
            return then('dormant');
        }

        if(slugTest !== undefined && !slugTest.test(slug)){
            return then('slug-redirect');
        }

        if(!config.server.slugged){
            delete query.slug;
        }

        // the website is live and the blog could be user-defined
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
                if (req.url !== '/'){
                    return then('available-redirect'); // not 301 because the slug can be claimed
                }
                return then('available');
            }
        });
    });

    function then(status){
        req.blogStatus = status;
        done(status);
    }
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

function findBlog(req,res){
    findBlogInternal(req,res,function(status){
        switch(status){
            case 'dormant-redirect': { // not 301 because the slug can be awaken
                return res.redirect(config.server.host);
            }
            case 'dormant': {
                req.blog = 'dormant';
                return renderView(req,res);
            }
            case 'slug-redirect': { // this slug is forbidden, 301 to the default blog.
                return res.redirect(config.server.host, 301);
            }
            case 'available-redirect': {
                return res.redirect('/');
            }
            case 'available': {
                req.blog = 'available';
                return renderView(req,res);
            }
            case 'blog': {
                return renderView(req,res);
            }
        }
    });
}

function renderView(req,res){
    var profile, locals,
        connected = req.user !== undefined,
        isBlogger = connected ? req.user.blogger : false;

    if(typeof req.blog === 'string'){
        profile = req.blog;
    }else{
        if(!connected){
            profile = 'anon';
            locals = {
                profile: 'anon',
                connected: false
            };
        }else{
            if(!isBlogger){
                profile = 'registered';
            }else{
                profile = 'blogger';
            }
            locals = {
                id: req.user._id,
                profile: profile,
                connected: true,
                blogger: isBlogger
            };

            var description = req.blog.description || 'Welcome to my personal blog!',
                html = (new pagedown.getSanitizingConverter()).makeHtml(description);

            req.blog.descriptionHtml = html;
        }
        locals.site = {
            title: req.blog.title,
            thumbnail: req.blog.thumbnail
        };
        res.locals.assetify.js.add('!function(a){a.locals=' + JSON.stringify(locals) + ';}(window);', 'before');
    }

    res.render('layouts/' + profile + '.jade', {
        profile: profile,
        blog: req.blog,
        blogger: req.blogger
    });
}

function awaken(req,res,next){
    var email = req.body['user.email'],
        password = req.body['user.password'],
        title = req.body['blog.title'];

    if(!email || !password || !title){ // the most basic form of validation, since it's just the super admin
        req.flash('validation', 'Oops, you should fill out every field');
        res.redirect('/');
        return;
    }

    user.findOne({ email: email }, function(err, document){ // easier migration from v0.2
        if(!document){
            document = new user({
                email: email,
                displayName: email.split('@')[0],
                password: password
            });
            document.save(function(err, document){
                then(document);
            });
        }else{
            then(document);
        }
    });

    function then(user){
        new blog({
            owner: user._id,
            slug: getBlogSlug(req),
            title: title,
            social: {
                rss: true
            }
        }).save(function(){
            live = true;
            res.redirect('/');
        });
    }
}

function claim(req,res,next){
    getStatus(function(){
        if(!live){ // dormant
            awaken(req,res,next);
        }else if(!config.server.slugged){
            return next(); // claiming is disabled
        }else{ // attempt to claim
            var slug = getBlogSlug(req),
                slugTest = config.server.slugRegex;

            if(slugTest !== undefined && !slugTest.test(slug)){
                return next(); // this slug is an alias of the main blog.
            }

            blog.findOne({ slug: slug }, function(err, document){
                if(document !== null){
                    return next(); // this blog is taken, can no longer be claimed.
                }else{ // allow the user to grab the blog
                    // TODO: handle POST claim requests, validate req.user (or create from req.body), only one blog per user account
                }
            });
        }
    });
}

function hostValidation(req,res,next){
    var val = config.server.hostRegex;
    if (val !== undefined && !val.test(req.host)){
        res.redirect(config.server.host + req.url, 301);
        return;
    }

    // crucial: appends blog, blogStatus and blogger to the request.
    findBlogInternal(req,res,function(req,res,status){
        next();
    });
}

module.exports = {
    hostValidation: hostValidation,
    get: findBlog,
    claim: claim
};