var config = {
    env: {
        current: process.env.NODE_ENV || 'development'
    },
    server: {
        host: process.env.HOST || 'http://localhost',
        port: parseInt(process.env.PUBLIC_PORT || 8081)
    },
    db: {
        uri: process.env.MONGOLAB_URI || 'mongodb://localhost/nbrut'
    },
    security: {
        saltWorkFactor: parseInt(process.env.SALT_WORK_FACTOR || 10),
        sessionSecret: process.env.SESSION_SECRET || 'local'
    }
};

var host = config.server.host,
    portUrl = '';

if (host[host.length-1] === '/'){
    host = host.substr(0, host.length-1);
}

if(config.server.port !== 80){
    portUrl = ':' + config.server.port;
}

config.server.authority = host + portUrl;

config.env.development = config.env.current === 'development';
config.env.staging = config.env.current === 'staging';
config.env.production = config.env.current === 'production' || config.env.staging;

module.exports = config;