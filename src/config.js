module.exports = {
    env: process.env.NODE_ENV,
	server: {
		port: process.env.PORT || 8081
	},
    db: {
        uri: process.env.MONGOLAB_URI || 'mongodb://localhost/nbrut'
    },
    security: {
        saltWorkFactor: process.env.SALT_WORK_FACTOR || 10,
        sessionSecret: process.env.SESSION_SECRET || 'local'
    }
};