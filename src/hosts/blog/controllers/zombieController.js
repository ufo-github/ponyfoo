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
                /Googlebot/i, // Google
                /facebookexternalhit/i, // Facebook
                /bingbot/i, // Bing
                /slurp/i, // Yahoo!
                /LinkedInBot/i, // LinkedIn
                /Twitterbot/i, // Twitter
                /Instapaper/i, // Instapaper
                /diffbot/i, // Diffbot
                /pear\.php\.net/i // pocket uses HTTP_Request2/2.1.1 (http://pear.php.net/package/http_request2) PHP/X
            ],
            zombieService = require('../../../service/zombieService.js'),
            zombie = zombieService.setup(server, userAgents, loaded);

        return {
            crawlerInterceptor: zombie.proxy
        };
    }
};