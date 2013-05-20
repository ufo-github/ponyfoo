'use strict';

var path = require('path'),
    env = require('./env.js'),
    cwd = process.cwd();

var config = {
    cwd: cwd,
    pkg: require(path.join(cwd, '/package.json')),
    env: {
        current: env.NODE_ENV,
        get development(){ return this.current === 'development'; },
        get staging(){ return this.current === 'staging'; },
        get production(){ return this.current === 'production' || this.staging; }
    },
    statics: {
        folder: function(base){ return path.join(base, '/static'); },
        bin: function(base){ return path.join(base, '/static/.bin'); },
        faviconSource: path.resolve(__dirname, '../frontend/favicon.ico'),
        favicon: '/favicon.ico'
    },
    server: {
        tld: env.HOST_TLD,
        slugged: env.ENABLE_SLUGGING,
        slugMarket: env.HOST_MARKET,
        slugRegex: env.BLOG_REGEX ? new RegExp('^' + env.BLOG_REGEX + '$') : undefined,
        get host(){ return this.hostSlug(this.slugged ? this.slugMarket : null); },
        hostRegex: env.HOST_REGEX ? new RegExp('^' + env.HOST_REGEX + '$') : undefined,
        get defaultBlog(){ return env.BLOG_DEFAULT; },
        get defaultBlogUrl(){ return this.hostSlug(this.defaultBlog); },
        listener: env.PORT,
        get port(){ return env.PUBLIC_PORT || this.listener; },
        get portPart(){ return this.port === 80 ? '' : ':' + this.port; },
        hostSlug: function(slug){
            var vanity = slug ? (slug + '.') : '';
            return 'http://' + vanity + this.tld + this.portPart;
        },
        get landingSlug(){ return this.slugged ? this.slugMarket : this.defaultBlog; },
        permanentRedirect: env.ENABLE_BLOG_REGEX_301
    },
    server2: require('./server.js'),
    logging: { level: env.LOG_LEVEL },
    zombie: {
        enabled: env.ENABLE_ZOMBIE_CRAWLER,
        cache: 60000 * 60 // an hour, in ms
    },
    db: { uri: env.MONGOLAB_URI || env.MONGO_URI || 'mongodb://localhost/nbrut' },
    security: {
        saltWorkFactor: env.SALT_WORK_FACTOR,
        sessionSecret: env.SESSION_SECRET
    },
    tracking: {
        analytics: env.GA_CODE,
        clicky: env.CLICKY_SITE_ID
    },
    get opensearch() {
        return {
            source: path.join(this.statics.folder, 'opensearch.xmln'),
            relative: '/opensearch.xml',
            template: '/search/{searchTerms}'
        };
    },
    sitemapIndex: {
        cache: 60000 * 30, // half an hour, in ms
        relative: '/sitemap_index.xml',
        physical: function(){
            return '/sitemaps/__index.xml';
        }
    },
    sitemap: {
        cache: 60000 * 30, // half an hour, in ms
        relative: '/sitemap.xml',
        physical: function(slug){
            return '/sitemaps/' + (slug || '__market') + '.xml';
        }
    },
    feed: {
        cache: 60000 * 30, // relatively short-lived cache survives for half an hour
        relative: '/rss/latest.xml',
        physical: function(slug){
            return '/rss/' + slug + '.xml';
        },
        limit: 12
    },
    get site() {
        return {
            doctype: '<!DOCTYPE html>',
            thumbnail: this.server.host + '/img/thumbnail.png',
            displayVersion: env.ENABLE_VERSION_DISPLAY,
            version: 'v' + this.pkg.version,
            get versionString(){ return '<!-- engine: ' + this.version + ' -->'; }
        };
    },
    regex: {
        email: /^[a-z0-9.!#$%&'*+\/=?\^_`{|}~\-]+@[a-z0-9\-]+(?:\.[a-z0-9\-]+)*$/i,
        link: /\bhttps?:\/\/[\-a-z0-9+&@#\/%?=~_|!:,.;]*[\-a-z0-9+&@#\/%=~_|]/i
    },
    auth: {
        success: '/',
        register: '/user/register',
        logout: '/user/logout',
        login: '/user/login',
        facebook: {
            get enabled(){ return this.id && this.secret; },
            id: env.FACEBOOK_APP_ID,
            secret: env.FACEBOOK_APP_SECRET,
            link: '/user/login/facebook',
            callback: '/user/login/facebook/callback'
        },
        github: {
            get enabled(){ return this.id && this.secret; },
            id: env.GITHUB_CLIENT_ID,
            secret: env.GITHUB_CLIENT_SECRET,
            link: '/user/login/github',
            callback: '/user/login/github/callback'
        },
        google: {
            enabled: true,
            link: '/user/login/google',
            callback: '/user/login/google/callback'
        },
        linkedin: {
            get enabled(){ return this.id && this.secret; },
            id: env.LINKEDIN_API_KEY,
            secret: env.LINKEDIN_API_SECRET,
            link: '/user/login/linkedin',
            callback: '/user/login/linkedin/callback'
        }
    },
    uploads: { imgurKey: env.IMGUR_API_KEY },
    avatar: {
        url: 'http://www.gravatar.com/avatar/',
        query: '?d=identicon&r=PG',
        tiny: '&s=24',
        small: '&s=40',
        regular: '&s=60'
    },
    contact: {
        twitter: env.CONTACT_TWITTER,
        email: env.CONTACT_EMAIL ? 'mailto:' + env.CONTACT_EMAIL : undefined
    }
};

module.exports = config;