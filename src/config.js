module.exports = {
	server: {
		port: process.env.PORT || 8081
	},
    db: {
        uri: process.env.MONGOLAB_URI || 'mongodb://localhost/nbrut'
    }
};