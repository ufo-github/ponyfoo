'use strict';

var path = require('path'),
    env = process.env;

var config = {
    pkg: require('../package.json'),
    env: {
        current: env.NODE_ENV || 'development',
        get development(){ return this.current === 'development'; },
        get staging(){ return this.current === 'staging'; },
        get production(){ return this.current === 'production' || this.staging; }
    },
    statics: {
        folder: path.join(__dirname, '/static'),
        bin: path.join(__dirname, '/static/.bin'),
        faviconSource: '/img/favicon.ico',
        favicon: '/favicon.ico'
    },
    server: {
        tld: env.HOST_TLD || 'local-sandbox.com',
        slugged: env.HOST_SLUG_ENABLED === 'true',
        slugHome: env.HOST_SLUG_DEFAULT || 'www',
        slugRegex: env.HOST_SLUG_REGEX ? new RegExp('^' + env.HOST_SLUG_REGEX + '$') : undefined,
        get host(){ return this.hostSlug(this.slugged ? this.slugHome : null); },
        hostRegex: env.HOST_REGEX ? new RegExp('^' + env.HOST_REGEX + '$') : undefined,
        listener: parseInt(env.PORT || 8081, 10),
        get port(){ return parseInt(env.PUBLIC_PORT || this.listener, 10); },
        get portPart(){ return this._p = this._p || (this.port === 80 ? '' : ':' + this.port); },
        hostSlug: function(slug){
            var vanity = slug ? (slug + '.') : '';
            return 'http://' + vanity + this.tld + this.portPart;
        },
        permanentRedirect: env.HOST_SLUG_REGEX_301 === 'true'
    },
    zombie: {
        enabled: env.ZOMBIE_CRAWLER || true,
        cache: 60000 * 60 // an hour, in ms
    },
    db: { uri: env.MONGOLAB_URI || env.MONGO_URI || 'mongodb://localhost/nbrut' },
    security: {
        saltWorkFactor: parseInt(env.SALT_WORK_FACTOR || 10, 10),
        sessionSecret: env.SESSION_SECRET || 'local'
    },
    tracking: {
        analytics: env.GA_CODE,
        clicky: parseInt(env.CLICKY_SITE_ID || '', 10)
    },
    get opensearch() {
        return this._o = this._o || {
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
            return '/sitemaps/' + slug + '.xml';
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
            shareVersion: env.SHOW_VERSION === 'true',
            version: '<!-- engine version: ' + this.pkg.version + ' -->'
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
    }
};

module.exports = config;