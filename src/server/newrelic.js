'use strict';

var config = require('../config.js');

function init(){
    if(!!process.env.NEW_RELIC_NO_CONFIG_FILE && !!process.env.NEW_RELIC_LICENSE_KEY){
        require('newrelic');
    }
}

module.exports = {
    init: init
};