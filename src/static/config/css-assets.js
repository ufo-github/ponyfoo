'use strict';

var common = require('./common.js'),
    registered = ['blogger', 'registered'],
    design = [
        'dormant',
        'blogger',
        'registered',
        'anon'
    ];

function getBarebones(){ // reset and most elemental styles
    return [
        '/css/defaults/reset.css',
        '/css/defaults/basic.less'
    ];
}

function getCommonDesign(){ // basic layout and design
    var sheets = [
        '/css/defaults/elements.less',
        '/css/defaults/controls.less',
        '/css/defaults/controls.spinner.less',
        '/css/defaults/layout.less',
        '/css/defaults/design.less',
        '/css/defaults/sprite.less'
    ];

    for(var i = 0;i < sheets.length; i++){
        sheets[i] = common.mapSharedTo(design, sheets[i]);
    }

    return sheets;
}

function getRaw(){
    return [
        { profile: design, local: '/css/vendor/markdown.less' },
        { profile: 'market', local: '/css/market/defaults.less' },
        { profile: 'market', local: '/css/market/controls.less' },
        { profile: 'market', local: '/css/market/layout.less' },
        { profile: 'market', local: '/css/market/navigation.less' },
        { profile: 'market', local: '/css/market/content.less' },
        { profile: 'dormant', local: '/css/dormant/index.less' }
    ];
}

function getVendorLibraries(){
    return [
        '/css/vendor/markdown.editor.less',
        '/css/vendor/prettify.less',
        '/css/vendor/hint.less'
    ];
}

function getShared(){
    return [
        '/css/views/shared/404.less',
        { profile: 'anon', local: '/css/views/shared/authentication.less' },
        '/css/views/shared/upload.less',
        '/css/views/shared/expand.less',
        '/css/views/shared/table.pager.less'
    ];
}

function getViews(){
    return [
        '/css/views/user/profile.less',
        { profile: registered, local: '/css/views/user/profile.edit.less' },
        { profile: 'anon', local: '/css/views/user/_providers.less' },
        { profile: 'anon', local: '/css/views/user/authentication.less' },

        '/css/views/blog/entries.less',
        '/css/views/blog/comments.less',
        { profile: registered, local: '/css/views/blog/comments.registered.less' },

        { profile: 'blogger', local: '/css/views/blogger/index.less' },
        { profile: 'blogger', local: '/css/views/blogger/blog.less' },
        { profile: 'blogger', local: '/css/views/blogger/editor.less' },
        { profile: 'blogger', local: '/css/views/blogger/review.less' },
        { profile: 'blogger', local: '/css/views/blogger/discussions.less' },
        { profile: 'blogger', local: '/css/views/blogger/users.less' }
    ];
}

function getCss(){
    var raw = Array.prototype.concat.apply([], [
            getBarebones(),
            getCommonDesign(),
            getRaw()
        ]),
        blog = Array.prototype.concat.apply([], [
            getVendorLibraries(),
            getShared(),
            getViews()
        ]);

    for(var i = 0;i < blog.length; i++){
        blog[i] = common.mapSharedToBlogOnly(blog[i]);
    }

    return raw.concat(blog);
}

module.exports = {
    assets: getCss()
};