var config = {
    env: {
        current: process.env.NODE_ENV || 'development'
    },
    server: {
        host: process.env.HOST || 'http://localhost',
        listener: parseInt(process.env.PORT || 8081)
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
    site: {
        title: 'Pony Foo',
        description: 'Ramblings of a degenerate coder',
        relativeThumbnail: '/img/thumbnail.png',
        relativeFeed: '/feed/latest.rss'
    },
    author: {
        email: 'nicolasbevacqua@gmail.com',
        github: 'https://github.com/bevacqua',
        stackoverflow: 'http://careers.stackoverflow.com/bevacqua',
        linkedin: 'http://linkedin.com/in/nbevacqua/',
        about: "I'm Nicolas Bevacqua. I live in Buenos Aires, Argentina. This is my technical blog.",
        social: 'Feel free to visit my social accounts below:'
    }
};

function buildAuthorityUrl(){
    var host = config.server.host,
        portUrl = '';

    config.server.port = parseInt(process.env.PUBLIC_PORT || config.server.listener);

    if (host[host.length-1] === '/'){
        host = host.substr(0, host.length-1);
    }

    if(config.server.port !== 80){
        portUrl = ':' + config.server.port;
    }

    config.server.authority = host + portUrl;
}

buildAuthorityUrl();

config.site.thumbnail = config.server.authority + config.site.relativeThumbnail;
config.site.feed = config.server.authority + config.site.relativeFeed;

config.env.development = config.env.current === 'development';
config.env.staging = config.env.current === 'staging';
config.env.production = config.env.current === 'production' || config.env.staging;

module.exports = config;