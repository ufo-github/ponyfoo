var config = require('./config.js'),
    base = __dirname + '/static',
    assetify = require('node-assetify'),
    assets = {
        source: base,
        bin: base + '/bin',
        css: [
            '/css/defaults/reset.css',
            '/css/defaults/elements.less',
            '/css/defaults/controls.less',
            '/css/defaults/layout.less',
            '/css/defaults/design.less',
            '/css/defaults/sprite.less',
            '/css/libs/markdown.less',
            '/css/libs/prettify.less',
            '/css/libs/pikaday.less',
            { profile: 'author', local: '/css/layouts/author.less' },
            '/css/views/main/entries.less',
            { profile: 'anon', local: '/css/views/user/register.less' },
            { profile: 'anon', local: '/css/views/user/login.less' },
            { profile: 'author', local: '/css/views/author/editor.less' },
            { profile: 'author', local: '/css/views/author/review.less' }
        ],
        js: [
            assetify.jQuery('1.8.3', '/js/jquery-1.8.3.min.js'),
            '/js/libs/moment.min.js',
            '/js/libs/mustache.js',
            '/js/libs/jquery.textarearesizer.min.js',
            '/js/libs/Markdown.Converter.js',
            '/js/libs/Markdown.Sanitizer.js',
            '/js/libs/Markdown.Editor.js',
            '/js/libs/prettify.js',
            '/js/libs/jquery.pikaday.js',
            '/js/ext/prettify.extensions.js',
            '/js/nbrut/nbrut.extensions.js',
            '/js/nbrut/nbrut.core.js',
            { local: '/js/nbrut/nbrut.node.jsn', context: { config: config } },
            '/js/nbrut/nbrut.md.js',
            '/js/nbrut/nbrut.ui.js',
            '/js/nbrut/nbrut.templates.js',
            '/js/nbrut/nbrut.thin.js',
            '/js/nbrut/nbrut.init.js',
            '/js/views/thin.hooks.js',
            '/js/views/templates.js',
            { profile: 'anon', local: '/js/views/templates.anon.js' },
            { profile: 'author', local: '/js/views/templates.author.js'},
            '/js/views/main/entries.js',
            '/js/views/main/entry.js',
            { profile: 'author', local: '/js/views/author/editor.js' },
            { profile: 'author', local: '/js/views/author/review.js' }
        ]
    };

if(config.tracking.code !== undefined){
    assets.js.push({ local: '/js/ext/analytics.jsn', context: { config: config } });
}

module.exports = assets;