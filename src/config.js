var path = require('path'),
    assetify = require('assetify');

var config = {
    env: {
        current: process.env.NODE_ENV || 'development',
        get development(){ return this._d = this._d || this.current === 'development'; },
        get staging(){ return this._s = this._s || this.current === 'staging'; },
        get production(){ return this._p = this._p || this.current === 'production' || this.staging; }
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
        host: process.env.HOST || 'http://localhost',
        listener: parseInt(process.env.PORT || 8081),
        get port(){ return this._p = this._p || parseInt(process.env.PUBLIC_PORT || this.listener); },
        get authority(){
            if(this._a === undefined){
                var host = this.host,
                    portUrl = '';

                if (host[host.length-1] === '/'){
                    host = host.substr(0, host.length-1);
                }

                if(this.port !== 80){
                    portUrl = ':' + this.port;
                }
                this._a = host + portUrl;
            }
            return this._a;
        }
    },
    db: {
        uri: process.env.MONGOLAB_URI || 'mongodb://localhost/nbrut'
    },
    security: {
        saltWorkFactor: parseInt(process.env.SALT_WORK_FACTOR || 10),
        sessionSecret: process.env.SESSION_SECRET || 'local'
    },
    tracking: {
        code: process.env.GA_CODE
    },
    get site() {
        return this._s = this._s || {
            title: 'Pony Foo',
            description: 'Ramblings of a degenerate coder',
            thumbnail: this.server.authority + '/img/thumbnail.png'
        };
    },
    get feed() {
        return this._f = this._f || {
            local: this.server.authority + '/rss/latest.xml',
            get proxy(){ return this._p = this._p || (process.env.FEED_ADDR || this.local); },
            limit: 12
        };
    },
    author: {
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
        email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*$/i
    }
};

module.exports = config;