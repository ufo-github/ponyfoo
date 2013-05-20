'use strict';

var pagedown = require('pagedown'),
    fs = require('fs'),
    path = require('path');

function getProfile(req){
    var connected = req.user !== undefined,
        blogger = connected ? req.user.blogger : false;

    if(connected){
        return blogger ? 'blogger' : 'registered';
    }else{
        return 'anon';
    }
}

function getView(req,res){
    var view, viewModel, locals, json,
        connected = !!req.user,
        profile = getProfile(req);

    view = 'slug/__' + profile + '.jade';
    locals = {
        id: connected ? req.user._id : undefined,
        blogger: profile === 'blogger',
        profile: profile,
        connected: connected,
        site: {
            title: req.blog.title,
            thumbnail: req.blog.thumbnail
        }
    };
    
    json = '!function(a){a.locals=' + JSON.stringify(locals) + ';}(window);';
    res.locals.assetify.js.add(json, 'before');

    viewModel = {
        query: req.query, // query string parameters
        profile: profile,
        slug: req.slug,
        blog: req.blog,
        blogger: req.blogger
    };

    if (connected){
        var pd = new pagedown.getSanitizingConverter(),
            description = req.blog.description || 'Welcome to my personal blog!',
            html = pd.makeHtml(description);

        req.blog.descriptionHtml = html;
    }

    res.render(view, viewModel);
}

module.exports = {
    getView: getView
};