'use strict';

var common = require('./common.js'),
    design = [
        'dormant',
        'anon',
        'registered',
        'blogger'
    ];

function getBarebones(){ // reset and most elemental styles
    return [
        '/css/defaults/reset.css',
        '/css/defaults/basic.less'
    ];
}

function getCommonDesign(){ // basic layout and design
    return [
        { profile: design, local: '/css/defaults/elements.less' },
        { profile: design, local: '/css/defaults/controls.less' },
        { profile: design, local: '/css/defaults/controls.spinner.less' },
        { profile: design, local: '/css/defaults/layout.less' },
        { profile: design, local: '/css/defaults/design.less' },
        { profile: design, local: '/css/defaults/sprite.less' }
    ];
}

function getRaw(){
    return [
        { profile: design, local: '/css/vendor/markdown.less' },
        { profile: 'market', local: '/css/market/defaults.less' },
        { profile: 'market', local: '/css/market/sprite.less' },
        { profile: 'market', local: '/css/market/controls.less' },
        { profile: 'market', local: '/css/market/layout.less' },
        { profile: 'market', local: '/css/market/navigation-layout.less' },
        { profile: 'market', local: '/css/market/navigation.less' },
        { profile: 'market', local: '/css/market/availability.less' },
        { profile: 'market', local: '/css/market/features.less' },
        { profile: 'market', local: '/css/market/design.less' },
        { profile: 'dormant', local: '/css/dormant/index.less' }
    ];
}

function getVendorLibraries(){
    return [
        { profile: common.blog, local: '/css/vendor/markdown.editor.less' },
        { profile: common.blog, local: '/css/vendor/prettify.less' },
        { profile: common.profiles, local: '/css/vendor/hint.less' }
    ];
}

function getShared(){
    return [
        { profile: common.blog, local: '/css/views/shared/404.less' },
        { profile: 'anon', local: '/css/views/shared/authentication.less' },
        { profile: common.blog, local: '/css/views/shared/upload.less' },
        { profile: common.blog, local: '/css/views/shared/expand.less' },
        { profile: common.blog, local: '/css/views/shared/table.pager.less' }
    ];
}

function getViews(){
    return [
        { profile: common.blog, local: '/css/views/user/profile.less' },
        { profile: common.registered, local: '/css/views/user/profile.edit.less' },
        { profile: 'anon', local: '/css/views/user/_providers.less' },
        { profile: 'anon', local: '/css/views/user/authentication.less' },

        { profile: common.blog, local: '/css/views/blog/entries.less' },
        { profile: common.blog, local: '/css/views/blog/comments.less' },
        { profile: common.registered, local: '/css/views/blog/comments.registered.less' },

        { profile: 'blogger', local: '/css/views/blogger/index.less' },
        { profile: 'blogger', local: '/css/views/blogger/blog.less' },
        { profile: 'blogger', local: '/css/views/blogger/editor.less' },
        { profile: 'blogger', local: '/css/views/blogger/review.less' },
        { profile: 'blogger', local: '/css/views/blogger/discussions.less' },
        { profile: 'blogger', local: '/css/views/blogger/users.less' }
    ];
}

function getCss(){
    return Array.prototype.concat.apply([], [
        getBarebones(),
        getCommonDesign(),
        getRaw(),
        getVendorLibraries(),
        getShared(),
        getViews()
    ]);
}

module.exports = {
    assets: getCss()
};