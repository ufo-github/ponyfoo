'use strict';

var env = require('./env.js');

module.exports = {
    on: env.ENABLE_MARKET,
    articles: env.MARKET_ARTICLE_COUNT
};