var config = require('./config.js');

function init(){
    if(!!process.env.NEW_RELIC_LICENSE_KEY){
        require('newrelic');
    }
}

module.exports = {
    init: init,
    app_name : [config.site.title],
    logging : {
        level : 'info'
    }
};