var config = require('./config.js'),
    assetify = require('assetify'),
    assets = {
        source: config.static.folder,
        bin: config.static.bin,
        css: getCss(),
        js: getJs(),
        profiles: ['anon','registered','author']
    },
    registered = ['anon', 'registered'];

function getCss(){
    return [
        '/css/defaults/reset.css',
        '/css/defaults/elements.less',
        '/css/defaults/controls.less',
        '/css/defaults/layout.less',
        '/css/defaults/design.less',
        '/css/defaults/sprite.less',
        '/css/libs/markdown.less',
        '/css/libs/prettify.less',
        '/css/views/blog/entries.less',
        { profile: 'anon', local: '/css/views/user/register.less' },
        { profile: 'anon', local: '/css/views/user/login.less' },
        { profile: 'author', local: '/css/views/author/editor.less' },
        { profile: 'author', local: '/css/views/author/review.less' }
    ];
}

function getJs(){
    var js = [
        config.jQuery.asset,
        '/js/libs/moment.min.js',
        '/js/libs/mustache.js',
        '/js/libs/jquery.textarearesizer.min.js',
        '/js/libs/Markdown.Converter.js',
        '/js/libs/Markdown.Sanitizer.js',
        '/js/libs/Markdown.Editor.js',
        '/js/libs/prettify.js',
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
        '/js/views/templates.hooks.js',
        '/js/views/templates.js',
        '/js/views/templates.entries.js',
        { profile: 'anon', local: '/js/views/templates.anon.js' },
        { profile: registered, local: '/js/views/templates.registered.js' },
        { profile: 'author', local: '/js/views/templates.author.js'},
        '/js/views/blog/entries.js',
        '/js/views/blog/search.js',
        { profile: 'anon', local: '/js/views/user/login.js' },
        { profile: 'anon', local: '/js/views/user/register.js' },
        { profile: 'author', local: '/js/views/author/editor.js' },
        { profile: 'author', local: '/js/views/author/review.js' }
    ];

    if(config.tracking.code !== undefined){
        js.push({ local: '/js/ext/analytics.jsn', context: { config: config } });
    }

    return js;
}

assets.compile = function(done){
    assetify.use(assetify.plugins.less);
    assetify.use(assetify.plugins.jsn);

    if (config.env.production){
        assetify.use(assetify.plugins.bundle);
        assetify.use(assetify.plugins.minifyCSS);
        assetify.use(assetify.plugins.minifyJS);
    }
    assetify.use(assetify.plugins.forward());
    assetify.compile(assets, done);
};

module.exports = assets;