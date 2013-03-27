'use strict';

var path = require('path'),
    common = require('./common.js'),
    config = require('./../../config.js');

function getMarket(){
    return [
        { profile: 'market', local: '/js/ext/jquery.layout.js' },
        { profile: 'market', local: '/js/market/navigation.js' },
        { profile: 'market', local: '/js/market/registration.js' }
    ];
}

function getVendorLibraries(){
    return [
        { profile: common.blog, local: '/js/vendor/moment.min.js' },
        { profile: common.blog, local: '/js/vendor/mustache.js' },
        { profile: common.blog, local: '/js/vendor/jquery.color-2.1.1.js' },
        { profile: common.blog, local: '/js/vendor/jquery.ui.widget.js' },
        { profile: common.blog, local: '/js/vendor/jquery.fileupload.js' },
        { profile: common.blog, local: '/js/vendor/jquery.textarearesizer.min.js' },
        { profile: common.blog, local: '/js/vendor/Markdown.Converter.js' },
        { profile: common.blog, local: '/js/vendor/Markdown.Sanitizer.js' },
        { profile: common.blog, local: '/js/vendor/prettify.js' }
    ];
}

function getExtensions(){
    return [
        { profile: common.blog, local: '/js/ext/String.js' },
        { profile: common.blog, local: '/js/ext/prettify.js' },
        { profile: common.blog, local: '/js/ext/jquery.layout.js' },
        { profile: common.blog, local: '/js/ext/jquery.ui.js' }, // not the well known, huge, and hideous, jQuery UI. just a few extensions
        { profile: common.blog, local: '/js/ext/jquery.nbrut.js' }
    ];
}

function getNBrut(){
    return [
        { profile: common.blog, local: '/js/nbrut/nbrut.core.js' },
        { profile: common.blog, local: '/js/nbrut/nbrut.node.jsn', context: { config: config } },
        { profile: common.blog, local: '/js/nbrut/nbrut.pluginFactory.js' },
        { profile: common.blog, local: '/js/nbrut/nbrut.md.js' },
        { profile: common.blog, local: '/js/nbrut/nbrut.ui.js' },
        { profile: common.blog, local: '/js/nbrut/nbrut.templates.js' },
        { profile: common.blog, local: '/js/nbrut/nbrut.thin.js' },
        { profile: common.blog, local: '/js/nbrut/nbrut.init.js' },

        { profile: common.blog, local: '/js/vendor/Markdown.Editor.js' } // depends on NBrut
    ];
}

function getHooks(){
    return [
        { profile: common.blog, local: '/js/views/hooks/thin.js' },
        { profile: common.blog, local: '/js/views/hooks/thin.validation.js' },
        { profile: common.blog, local: '/js/views/hooks/templates.js' },
        { profile: common.blog, local: '/js/views/hooks/templates.md.js' },
        { profile: common.blog, local: '/js/views/hooks/templates.metadata.js' }
    ];
}

function getTemplates(){
    return [
        { profile: common.blog, local: '/js/views/templates/shared.js' },
        { profile: common.blog, local: '/js/views/templates/markdown.js' },
        { profile: common.blog, local: '/js/views/templates/entries.js' },
        { profile: 'anon', local: '/js/views/templates/anon.js' },
        { profile: common.registered, local: '/js/views/templates/registered.js' },
        { profile: 'blogger', local: '/js/views/templates/blogger.js'}
    ];
}

function getPartials(){
    return [
        { profile: common.blog, local: '/js/views/shared/upload.js' },
        { profile: common.blog, local: '/js/views/shared/expand.section.js' },
        { profile: common.blog, local: '/js/views/shared/table.pager.js' },
        { profile: common.blog, local: '/js/views/markdown/prompts.js' }
    ];
}

function getAnonymousTemplates(){
    return [
        { profile: 'anon', local: '/js/views/user/authentication.js' }
    ];
}

function getSharedTemplates(){
    return [
        { profile: common.blog, local: '/js/views/user/profile.js' },
        { profile: common.blog, local: '/js/views/blog/search.js' },
        { profile: common.blog, local: '/js/views/blog/entries.js' }
    ];
}

function getRegisteredTemplates(){
    return [
        { profile: common.registered, local: '/js/views/user/profile.edit.js' },
        { profile: common.registered, local: '/js/views/blog/comments.registered.js' },
        { profile: common.registered, local: '/js/views/blog/comments.edit.js' }
    ];
}

function getBloggerTemplates(){
    return [
        { profile: 'blogger', local: '/js/views/blogger/blog.js' },
        { profile: 'blogger', local: '/js/views/blogger/editor.js' },
        { profile: 'blogger', local: '/js/views/blogger/review.js' },
        { profile: 'blogger', local: '/js/views/blogger/discussions.js' },
        { profile: 'blogger', local: '/js/views/blogger/users.js' }
    ];
}

function getAnalytics(){
    var js = [];

    if(!!config.tracking.analytics){
        js.push({ local: '/js/ext/analytics.jsn', context: { config: config } });
    }
    if(!!config.tracking.clicky){
        js.push({ local: '/js/ext/clicky.jsn', context: { config: config } });
    }
    return js;
}

function getJs(){
    var js = Array.prototype.concat.apply([], [
            getMarket(),
            getVendorLibraries(),
            getExtensions(),
            getNBrut(),
            getHooks(),
            getTemplates(),
            getPartials(),
            getAnonymousTemplates(),
            getSharedTemplates(),
            getRegisteredTemplates(),
            getBloggerTemplates(),
            getAnalytics()
        ]);

    if(config.env.development){
        js.push({ profile: common.blog, local: '/js/debug.js' });
    }
    return js;
}

module.exports = {
    assets: getJs()
};