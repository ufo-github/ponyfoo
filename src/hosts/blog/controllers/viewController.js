'use strict';

var pagedown = require('pagedown'),
    fs = require('fs'),
    path = require('path');

function getProfile(req){
    var connected = !!req.user,
        blogger = connected ? req.user.blogger : false;

    if(connected){
        return blogger ? 'blogger' : 'registered';
    }else{
        return 'anon';
    }
}

function getViewModel(req, profile){
    return {
        query: req.query, // query string parameters
        profile: profile,
        slug: req.slug,
        blog: req.blog,
        blogger: req.blogger
    };
}

function getSettingsJSON(req, profile){
    var connected = !!req.user,
        settings = {
            id: connected ? req.user._id : undefined,
            blogger: profile === 'blogger',
            profile: profile,
            connected: connected,
            site: {
                title: req.blog.title,
                thumbnail: req.blog.thumbnail
            }
        };

    return '!function(a){a.locals=' + JSON.stringify(settings) + ';}(window);';
}

function getView(req,res){
    var profile = getProfile(req),
        viewModel = getViewModel(req, profile),
        json = getSettingsJSON(req, profile),
        connected = !!req.user;
        
    res.locals.assetify.js.add(json, 'before');

    if (connected){
        var pd = new pagedown.getSanitizingConverter(),
            description = req.blog.description || 'Welcome to my personal blog!',
            html = pd.makeHtml(description);

        req.blog.descriptionHtml = html;
    }

    var viewName = '__' + profile + '.jade';
    res.render(viewName, viewModel);
}

module.exports = {
    getView: getView
};