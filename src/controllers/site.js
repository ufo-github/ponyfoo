var config = require('../config.js'),
    blog = require('../models/blog.js'),
    user = require('../models/user.js'),
    rest = require('../services/rest.js'),
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

function findBlog(req,res){
    getStatus(function(){
        var slug = getBlogSlug(req),
            slugTest = config.server.slugRegex,
            query = { slug: slug };

        if(!live){ // platform isn't configured at all
            if (req.url !== '/' || slug !== config.server.slugHome){
                return res.redirect(config.server.host); // not 301 because the slug can be claimed
            }
            req.blog = 'dormant';
            return renderView(req,res);
        }

        if(slugTest !== undefined && !slugTest.test(slug)){
            return res.redirect(config.server.host, 301); // this slug is forbidden, 301 to the default blog.
        }

        if(!config.server.slugged){
            delete query.slug;
        }

        // the website is live and the blog could be user-defined
        blog.findOne(query, function(err, document){
            if(document !== null){ // this is the blog we're going to use
                req.blog = document;
            }else{ // allow the user to grab the blog
                if (req.url !== '/'){
                    return res.redirect('/'); // not 301 because the slug can be claimed
                }
                req.blog = 'available';
            }
            renderView(req,res);
        });
    });
}

function renderView(req,res){
    var profile, locals, connected = req.user !== undefined;

    if(typeof req.blog === 'string'){
        profile = req.blog;
    }else{
        if(!connected){
            profile = 'anon';
            locals = JSON.stringify({
                profile: 'anon',
                connected: false
            });
        }else{
            if(req.user.blogger !== true){
                profile = 'registered';
            }else{
                profile = 'blogger';
            }
            locals = JSON.stringify({
                id: req.user._id,
                profile: profile,
                connected: true,
                blogger: req.user._id.equals(req.blog.owner)
            });
        }
        res.locals.assetify.js.add('!function(a){a.locals=' + locals + ';}(nbrut);');
    }

    res.render('layouts/' + profile + '.jade', { profile: profile });
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
            title: title
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
        }else if(!config.server.slugged){ // claiming is disabled
            return rest.error({
                res: res,
                code: 403,
                message: 'Blog slugs are disabled on this platform.'
            });
        }else{ // attempt to claim
            var slug = getBlogSlug(req),
                slugTest = config.server.slugRegex;

            if(slugTest !== undefined && !slugTest.test(slug)){
                return rest.error({ // this slug is forbidden, yield 403 Forbidden.
                    res: res,
                    code: 403,
                    message: 'Blog slug is reserved and can\'t be claimed.'
                });
            }

            blog.findOne({ slug: slug }, function(err, document){
                if(document !== null){
                    return rest.error({ // this blog is taken, yield 403 Forbidden.
                        res: res,
                        code: 403,
                        message: 'Blog slug in use'
                    });
                }else{ // allow the user to grab the blog
                    // TODO: handle POST claim requests, validate req.user (or create from req.body), only one blog per user account
                }
            });
        }
    });
}

module.exports = {
    hostValidation: function(req,res,next){
        var val = config.server.hostRegex;
        if (val !== undefined && !val.test(req.host)){
            res.redirect(config.server.authority + req.url, 301);
            return;
        }
        next();
    },
    get: findBlog,
    claim: claim
};