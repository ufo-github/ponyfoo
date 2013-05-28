'use strict';

var env = require('./env.js'),
    tld = env.HOST_TLD,
    slug = {
        enabled: env.ENABLE_SLUGGING,
        market: env.HOST_MARKET,
        blog: env.BLOG_DEFAULT,
        get landing(){ return this.enabled ? this.market : this.blog; }
    },
    port = {
        listener: env.PORT,
        visible: env.PUBLIC_PORT || env.PORT,
        toString: function(){
            return this.visible === 80 ? '' : ':' + this.visible;
        }
    };

function authority(slugName){
    var vanity = slug.enabled && slugName ? (slugName + '.') : '';
    return 'http://' + vanity + tld + port.toString();
}

module.exports = { // TODO eventually replace config.server
    tld: tld,
    authority: authority,
    authorityLanding: authority(slug.landing),
    authorityMarket: authority(slug.market),
    authorityBlog: authority(slug.blog),
    slug: slug,
    port: port
};