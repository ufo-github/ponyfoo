var config = require('../config.js');

function init(){
    if(config.plugins.newrelic){
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