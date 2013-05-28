'use strict';

var env = require('./env.js'),
    market = require('./market.js'),
    tld = env.HOST_TLD,
    slug = {
        enabled: env.ENABLE_SLUGGING,
        market: env.HOST_MARKET,
        blog: env.BLOG_DEFAULT,
        get landing(){ return market.on && this.enabled ? this.market : this.blog; }
    },
    port = {
        listener: env.PORT,
        visible: env.PUBLIC_PORT || env.PORT,
        toString: function(){
            return this.visible === 80 ? '' : ':' + this.visible;
        }
    };

function authority(slugName){
    var vanity = slugName ? (slugName + '.') : '';
    return 'http://' + vanity + tld + port.toString();
}

module.exports = {
    authority: authority,
    authorityLanding: authority(slug.landing),
    authorityMarket: authority(slug.market),
    authorityBlog: authority(slug.blog),
    tld: tld,
    rtld: env.HOST_REGEX ? new RegExp('^' + env.HOST_REGEX + '$') : undefined,
    rblog: env.BLOG_REGEX ? new RegExp('^' + env.BLOG_REGEX + '$') : undefined,
    slug: slug,
    port: port
};