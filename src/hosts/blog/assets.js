'use strict';

var config = require('../../config'),
    builder = require('../common/assetDataBuilder.js'),
    data = builder.prepare(__dirname),
    resolve = data.resolveFrontendPath;

data.assets.host = config.server2.authorityBlog;
data.assets.profiles =  ['blogger', 'registered', 'anon'];

var registered = ['blogger', 'registered'];

data.assets.css = [
    resolve('/css/defaults/reset.css'),
    resolve('/css/defaults/basic.less'),
    resolve('/css/defaults/elements.less'),
    resolve('/css/defaults/controls.less'),
    resolve('/css/defaults/controls.spinner.less'),
    resolve('/css/defaults/layout.less'),
    resolve('/css/defaults/design.less'),
    resolve('/css/defaults/sprite.less'),
    resolve('/css/vendor/markdown.less'),
    resolve('/css/vendor/hint.less'),

    resolve('/css/vendor/markdown.editor.less'),
    resolve('/css/vendor/prettify.less'),

    { profile: 'anon', local: '/css/views/shared/authentication.less' },
    '/css/views/shared/404.less',
    '/css/views/shared/upload.less',
    '/css/views/shared/expand.less',
    '/css/views/shared/table.pager.less',

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

data.assets.js = [
    resolve('/js/vendor/moment.min.js'),
    resolve('/js/vendor/mustache.js'),
    resolve('/js/vendor/jquery.color-2.1.1.js'),
    resolve('/js/vendor/jquery.ui.widget.js'),
    resolve('/js/vendor/jquery.fileupload.js'),
    resolve('/js/vendor/jquery.textarearesizer.min.js'),
    resolve('/js/vendor/Markdown.Converter.js'),
    resolve('/js/vendor/Markdown.Sanitizer.js'),
    resolve('/js/vendor/prettify.js'),
    resolve('/js/ext/String.js'),
    resolve('/js/ext/prettify.js'),
    resolve('/js/ext/jquery.layout.js'),
    resolve('/js/ext/jquery.ui.js'), // not the well known, huge, and hideous, jQuery UI. just a few extensions
    
    '/js/nbrut/jquery.nbrut.js',
    '/js/nbrut/nbrut.core.js',
    { local: '/js/nbrut/nbrut.node.jsn', context: { config: config } },
    '/js/nbrut/nbrut.pluginFactory.js',
    '/js/nbrut/nbrut.md.js',
    '/js/nbrut/nbrut.ui.js',
    '/js/nbrut/nbrut.templates.js',
    '/js/nbrut/nbrut.thin.js',
    '/js/nbrut/nbrut.analytics.js',
    '/js/nbrut/nbrut.init.js',
    resolve('/js/vendor/Markdown.Editor.js'), // depends on NBrut

    '/js/views/hooks/thin.js',
    '/js/views/hooks/thin.validation.js',
    '/js/views/hooks/templates.js',
    '/js/views/hooks/templates.md.js',
    '/js/views/hooks/templates.metadata.js',

    '/js/views/templates/shared.js',
    '/js/views/templates/markdown.js',
    '/js/views/templates/entries.js',
    { profile: 'anon', local: '/js/views/templates/anon.js' },
    { profile: registered, local: '/js/views/templates/registered.js' },
    { profile: 'blogger', local: '/js/views/templates/blogger.js'},

    '/js/views/shared/upload.js',
    '/js/views/shared/expand.section.js',
    '/js/views/shared/table.pager.js',

    '/js/views/markdown/prompts.js',

    { profile: 'anon', local: '/js/views/user/authentication.js' },
    '/js/views/user/profile.js',
    { profile: registered, local: '/js/views/user/profile.edit.js' },

    '/js/views/blog/search.js',
    '/js/views/blog/entries.js',
    { profile: registered, local: '/js/views/blog/comments.registered.js' },
    { profile: registered, local: '/js/views/blog/comments.edit.js' },
    
    { profile: 'blogger', local: '/js/views/blogger/blog.js' },
    { profile: 'blogger', local: '/js/views/blogger/editor.js' },
    { profile: 'blogger', local: '/js/views/blogger/review.js' },
    { profile: 'blogger', local: '/js/views/blogger/discussions.js' },
    { profile: 'blogger', local: '/js/views/blogger/users.js' }
];

data.assets.jQuery = { version: '1.9.1' };

module.exports = builder.complete(data);