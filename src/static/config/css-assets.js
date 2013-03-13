var common = require('./common.js');

function getBarebones(){ // basic layout and design
    return [
        '/css/defaults/reset.css',
        '/css/defaults/basic.less',
        '/css/defaults/elements.less',
        '/css/defaults/controls.less',
        '/css/defaults/controls.spinner.less',
        '/css/defaults/layout.less',
        '/css/defaults/design.less',
        '/css/defaults/sprite.less'
    ];
}

function getRaw(){
    return [
        { profile: 'dormant', local: '/css/dormant/index.less' },
        '/css/libs/markdown.less'
    ];
}

function getLibs(){
    return [
        '/css/libs/markdown.editor.less',
        '/css/libs/prettify.less',
        '/css/libs/hint.less'
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
        { profile: ['blogger', 'registered'], local: '/css/views/user/profile.edit.less' },
        { profile: 'anon', local: '/css/views/user/_providers.less' },
        { profile: 'anon', local: '/css/views/user/authentication.less' },

        '/css/views/blog/entries.less',
        '/css/views/blog/comments.less',
        { profile: ['blogger', 'registered'], local: '/css/views/blog/comments.registered.less' },

        { profile: 'blogger', local: '/css/views/blogger/index.less' },
        { profile: 'blogger', local: '/css/views/blogger/blog.less' },
        { profile: 'blogger', local: '/css/views/blogger/editor.less' },
        { profile: 'blogger', local: '/css/views/blogger/review.less' },
        { profile: 'blogger', local: '/css/views/blogger/discussions.less' },
        { profile: 'blogger', local: '/css/views/blogger/users.less' }
    ];
}

function getCss(){
    var barebones = getBarebones(),
        raw = getRaw(),
        libs = getLibs(),
        shared = getShared(),
        views = getViews(),
        blog = libs.concat(shared).concat(views);

    for(var i = 0;i < blog.length; i++){
        blog[i] = common.mapSharedProfileToBlogOnly(blog[i]);
    }

    return barebones.concat(raw).concat(blog);
}

module.exports = {
    assets: getCss()
};