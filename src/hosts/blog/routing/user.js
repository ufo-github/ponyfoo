'use strict';

var verificationController = require('../controllers/userVerificationController.js'),
    passwordResetController = require('../controllers/passwordResetController.js');

function configure(server){
    server.get('/user/verify-email/:token([a-f0-9]{24})', verificationController.verifyEmail);
    server.post('/user/request-password-reset', passwordResetController.requestPasswordReset);
    server.get('/user/password-reset/:token([a-f0-9]{24})', passwordResetController.validateToken);
    server.post('/user/reset-password/:token([a-f0-9]{24})', passwordResetController.resetPassword);
}

module.exports = {
    configure: configure
};