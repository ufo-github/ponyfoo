'use strict';

function loaded(window) {
    var container = window.$('main'),
        loading = container.is('.spinner-container');

    if(!loading && window.nbrut.thin.pending().length === 0){
        window.$('script').remove(); // make it _truly_ static
        return true;
    }
    return false;
}

module.exports = {
    configure: function(server){
        var userAgents = [
                /Googlebot/i, // google
                /facebookexternalhit/i, // facebook
                /bingbot/i, // bing
                /slurp/i, // yahoo slurp
                /LinkedInBot/i // linkedin
            ],
            zombieService = require('../../../service/zombieService.js'),
            zombie = zombieService.setup(server, userAgents, loaded);

        return {
            crawlerInterceptor: zombie.proxy
        };
    }
};