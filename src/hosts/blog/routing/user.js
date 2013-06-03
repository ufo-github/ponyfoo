'use strict';

var verificationController = require('../controllers/userVerificationController.js'),
    passwordResetController = require('../controllers/passwordResetController.js');

function configure(server){
    server.get('/user/verify-email/:token([a-f0-9]{24})', verificationController.verifyEmail);
    server.post('/user/request-password-reset', passwordResetController.requestPasswordReset);
    server.post('/user/reset-password', passwordResetController.resetPassword);
}

module.exports = {
    configure: configure
};