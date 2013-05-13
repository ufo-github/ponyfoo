'use strict';

var middleware = require('./middleware.js');

function configure(vhost){
	middleware.configure(vhost);

    if (config.env.development){
        vhost.use(express.logger({
        	format: 'dev'
    	}));

        vhost.use(express.errorHandler({
            showStack: true,
            dumpExceptions: true
        }));
    }

    done();
}