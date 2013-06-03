'use strict';

var verificationController = require('../controllers/userVerificationController.js');

function configure(server){
    server.get('/user/verify-email/:token([a-f0-9]{24})', verificationController.verifyEmail);
}

module.exports = {
    configure: configure
};