'use strict';

var subscriptionController = require('../controllers/blogSubscriptionController.js');

function configure(server){
    server.post('/email/subscribe', subscriptionController.postSubscribe);
    server.get('/email/confirm-subscription/:id([a-f0-9]{24})', subscriptionController.getConfirmSubscription);
    server.get('/email/unsubscribe/:id([a-f0-9]{24})', subscriptionController.getUnsubscribe);
}

module.exports = {
    configure: configure
};