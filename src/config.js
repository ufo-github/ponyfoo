var config = {
    env: {
        current: process.env.NODE_ENV || 'development'
    },
    server: {
        port: parseInt(process.env.PORT || 8081)
    },
    db: {
        uri: process.env.MONGOLAB_URI || 'mongodb://localhost/nbrut'
    },
    security: {
        saltWorkFactor: parseInt(process.env.SALT_WORK_FACTOR || 10),
        sessionSecret: process.env.SESSION_SECRET || 'local'
    }
};

config.env.development = config.env.current === 'development';
config.env.staging = config.env.current === 'staging';
config.env.production = config.env.current === 'production' || config.env.staging;

module.exports = config;