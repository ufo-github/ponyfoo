'use strict';

var path = require('path'),
    assetify = require('assetify'),
    common = require('./common.js'),
    config = require('./../../config.js'),
    jQueryVersion = '1.9.0',
    $ = assetify.jQuery(jQueryVersion, '/js/jquery-' + jQueryVersion + '.min.js', undefined, config.env.development);

function getVendorLibraries(){
    return [
        $,
        '/js/libs/moment.min.js',
        '/js/libs/mustache.js',
        '/js/libs/jquery.color-2.1.1.js',
        '/js/libs/jquery.ui.widget.js',
        '/js/libs/jquery.fileupload.js',
        '/js/libs/jquery.textarearesizer.min.js',
        '/js/libs/Markdown.Converter.js',
        '/js/libs/Markdown.Sanitizer.js',
        '/js/libs/prettify.js'
    ];
}

function getExtensions(){
    return [
        '/js/ext/String.js',
        '/js/ext/prettify.js',
        '/js/ext/jquery.layout.js',
        '/js/ext/jquery.ui.js', // not the well known, huge, and hideous, jQuery UI. just a few extensions
        '/js/ext/jquery.nbrut.js'
    ];
}

function getNBrut(){
    return [
        '/js/nbrut/nbrut.core.js',
        { local: '/js/nbrut/nbrut.node.jsn', context: { config: config } },
        '/js/nbrut/nbrut.pluginFactory.js',
        '/js/nbrut/nbrut.md.js',
        '/js/nbrut/nbrut.ui.js',
        '/js/nbrut/nbrut.templates.js',
        '/js/nbrut/nbrut.thin.js',
        '/js/nbrut/nbrut.init.js',

        '/js/libs/Markdown.Editor.js' // depends on NBrut
    ];
}

function getHooks(){
    return [
        '/js/views/hooks/thin.js',
        '/js/views/hooks/thin.validation.js',
        '/js/views/hooks/templates.js',
        '/js/views/hooks/templates.md.js',
        '/js/views/hooks/templates.metadata.js'
    ];
}

function getTemplates(){
    return [
        '/js/views/templates/shared.js',
        '/js/views/templates/markdown.js',
        '/js/views/templates/entries.js',
        { profile: 'anon', local: '/js/views/templates/anon.js' },
        { profile: ['blogger', 'registered'], local: '/js/views/templates/registered.js' },
        { profile: 'blogger', local: '/js/views/templates/blogger.js'}
    ];
}

function getPartials(){
    return [
        '/js/views/shared/upload.js',
        '/js/views/shared/expand.section.js',
        '/js/views/shared/table.pager.js',
        '/js/views/markdown/prompts.js'
    ];
}

function getAnonymousTemplates(){
    return [
        { profile: 'anon', local: '/js/views/user/authentication.js' }
    ];
}

function getSharedTemplates(){
    return [
        { profile: ['blogger', 'registered'], local: '/js/views/blog/comments.registered.js' },
        { profile: ['blogger', 'registered'], local: '/js/views/blog/comments.edit.js' },

        '/js/views/user/profile.js',
        '/js/views/blog/search.js',
        '/js/views/blog/entries.js'
    ];
}

function getRegisteredTemplates(){
    return [
        { profile: ['blogger', 'registered'], local: '/js/views/user/profile.edit.js' },
        { profile: ['blogger', 'registered'], local: '/js/views/blog/comments.registered.js' },
        { profile: ['blogger', 'registered'], local: '/js/views/blog/comments.edit.js' }
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
    var bundles = [
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
        ],
        js = Array.prototype.concat.apply([], bundles);

    if(config.env.development){
        js.push('/js/debug.js');
    }

    for(var i = 0;i < js.length; i++){
        js[i] = common.mapSharedProfileToBlogOnly(js[i]);
    }
    return js;
}

module.exports = {
    assets: getJs(),
    jQuery: {
        asset: $,
        local: path.join(config.static.folder, $.local)
    }
};