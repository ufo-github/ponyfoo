var path = require('path'),
    assetify = require('assetify'),
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
        bin: __dirname + '/static/bin'
    },
    get opensearch(){
        return this._o = this._o || {
            source: path.join(this.static.folder, 'opensearch.xmln'),
            bin: path.join(this.static.bin, 'opensearch.xml'),
            href: '/opensearch.xml',
            template: this.server.authority + '/search/{searchTerms}'
        };
    },
    server: {
        defaultSlug: env.HOST_DEFAULT_SLUG || 'www',
        tld: env.HOST_TLD || 'local-ponyfoo.com',
        tldReserved: env.HOST_TLD_RESERVED ? new RegExp('^' + env.HOST_TLD_RESERVED + '$') : undefined,
        get host(){ return 'http://' + this.defaultSlug + '.' + this.tld + this.portPart },
        hostRegex: env.HOST_REGEX ? new RegExp('^' + env.HOST_REGEX + '$') : undefined,
        listener: parseInt(env.PORT || 8081),
        get port(){ return parseInt(env.PUBLIC_PORT || this.listener); },
        get portPart(){ return this._p = this._p || (this.port === 80 ? '' : ':' + this.port); },
        get authority(){
            if(this._a === undefined){
                var host = this.host;
                if (host[host.length-1] === '/'){
                    host = host.substr(0, host.length-1);
                }
                this._a = host + this.portPart;
            }
            return this._a;
        }
    },
    sitemap: {
        refresh: 60000 * 60 // an hour, in ms
    },
    zombie: {
        enabled: env.ZOMBIE_CRAWLER || true,
        cache: 60000 * 60 // an hour, in ms
    },
    db: {
        uri: env.MONGOLAB_URI || 'mongodb://localhost/nbrut'
    },
    security: {
        saltWorkFactor: parseInt(env.SALT_WORK_FACTOR || 10),
        sessionSecret: env.SESSION_SECRET || 'local'
    },
    tracking: {
        code: env.GA_CODE
    },
    get feed() {
        return this._f = this._f || {
            local: this.server.authority + '/rss/latest.xml',
            get proxy(){ return env.FEED_ADDR || this.local; },
            limit: 12
        };
    },
    get site() {
        return this._s = this._s || {
            doctype: '<!DOCTYPE html>',
            title: 'Pony Foo',
            legend: 'Ramblings of a degenerate coder',
            description: 'Ramblings of a degenerate coder',
            thumbnail: this.server.authority + '/img/thumbnail.png'
        };
    },
    blogger: {
        name: 'Nicolas Bevacqua',
        email: 'nicolasbevacqua@gmail.com',
        github: 'https://github.com/bevacqua',
        stackoverflow: 'http://careers.stackoverflow.com/bevacqua',
        linkedin: 'http://linkedin.com/in/nbevacqua/',
        about: "I'm Nicolas Bevacqua. I live in Buenos Aires, Argentina. This is my technical blog.",
        social: 'Feel free to visit my social accounts below:'
    },
    get jQuery() {
        if (this._$ === undefined){
            var $ = assetify.jQuery('1.9.0', '/js/jquery-1.9.0.min.js', undefined, this.env.development);
            this._$ = {
                asset: $,
                local: path.join(this.static.folder, $.local),
                external: 'http:' + $.ext
            };
        }
        return this._$;
    },
    regex: {
        email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/i
    },
    auth: {
        success: '/',
        register: '/user/register',
        logout: '/user/logout',
        login: '/user/login',
        facebook: {
            id: env.FACEBOOK_APP_ID,
            secret: env.FACEBOOK_APP_SECRET,
            link: '/user/login/facebook',
            callback: '/user/login/facebook/callback'
        },
        github: {
            id: env.GITHUB_CLIENT_ID,
            secret: env.GITHUB_CLIENT_SECRET,
            link: '/user/login/github',
            callback: '/user/login/github/callback'
        },
        google: {
            link: '/user/login/google',
            callback: '/user/login/google/callback'
        },
        linkedin: {
            id: env.LINKEDIN_API_KEY,
            secret: env.LINKEDIN_API_SECRET,
            link: '/user/login/linkedin',
            callback: '/user/login/linkedin/callback'
        }
    },
    uploads: {
        imgurKey: env.IMGUR_API_KEY
    },
    avatar: {
        url: 'http://www.gravatar.com/avatar/',
        query: '?d=identicon&r=PG',
        tiny: '&s=24',
        small: '&s=40',
        regular: '&s=60'
    }
};

module.exports = config;