var path = require('path'),
    env = process.env;

var config = {
    env: {
        current: env.NODE_ENV || 'development',
        get development(){ return this.current === 'development'; },
        get staging(){ return this.current === 'staging'; },
        get production(){ return this.current === 'production' || this.staging; }
    },
    static: {
        folder: __dirname + '/static',
        bin: __dirname + '/static/bin',
        get faviconSource(){ return path.join(this.bin, '/img/favicon.ico'); },
        favicon: '/favicon.ico'
    },
    server: {
        tld: env.HOST_TLD || 'local-sandbox.com',
        slugged: !!env.HOST_SLUG_ENABLED || false,
        slugHome: env.HOST_SLUG_DEFAULT || 'www',
        slugRegex: env.HOST_SLUG_RESERVED ? new RegExp('^' + env.HOST_SLUG_RESERVED + '$') : undefined,
        get host(){ return this.hostSlug(this.slugHome); },
        hostRegex: env.HOST_REGEX ? new RegExp('^' + env.HOST_REGEX + '$') : undefined,
        listener: parseInt(env.PORT || 8081),
        get port(){ return parseInt(env.PUBLIC_PORT || this.listener); },
        get portPart(){ return this._p = this._p || (this.port === 80 ? '' : ':' + this.port); },
        hostSlug: function(slug){
            return 'http://' + slug + '.' + this.tld + this.portPart;
        }
    },
    zombie: {
        enabled: env.ZOMBIE_CRAWLER || true,
        cache: 60000 * 60 // an hour, in ms
    },
    db: { uri: env.MONGOLAB_URI || env.MONGO_URI || 'mongodb://localhost/nbrut' },
    security: {
        saltWorkFactor: parseInt(env.SALT_WORK_FACTOR || 10),
        sessionSecret: env.SESSION_SECRET || 'local'
    },
    tracking: {
        analytics: env.GA_CODE,
        clicky: parseInt(env.CLICKY_SITE_ID || '')
    },
    get opensearch() {
        return this._o = this._o || {
            source: path.join(this.static.folder, 'opensearch.xmln'),
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
            thumbnail: this.server.host + '/img/thumbnail.png'
        };
    },
    regex: {
        email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*$/i,
        link: /\bhttps?:\/\/[-a-z0-9+&@#/%?=~_|!:,.;]*[-a-z0-9+&@#/%=~_|]/i
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