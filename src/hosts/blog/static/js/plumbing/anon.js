!function (window,nbrut) {
    'use strict';

    var register = nbrut.tt.register;

    register({
        key: 'user-login',
        source: '#user-login-template',
        mustache: true,
        aliases: [{
            title: 'Login',
            route: '/user/login',
            trigger: '#login-user'
        }]
    });

    register({
        key: 'authentication',
        source: '#authentication-required-template',
        mustache: true
    });

    register({
        key: 'user-password-reset',
        source: '#user-password-reset-template',
        mustache: true
    });
}(window,nbrut);