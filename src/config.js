module.exports = {
	server: {
		port: process.env.PORT || 8081,
        sessionSecret: process.env.SESSION_SECRET || 'local'
	},
    db: {
        uri: process.env.MONGOLAB_URI || 'mongodb://localhost/nbrut'
    }
};