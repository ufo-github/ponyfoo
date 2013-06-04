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
        mustache: true,
        aliases: [{
            title: 'Reset Password',
            route: {
                regex: /^\/user\/password-reset\/([0-9a-f]{24})$/,
                get: function(data){
                    return '/user/password-reset/{0}'.format(data.id);
                },
                map: function(captures){
                    return { tokenId: captures[1] };
                }
            }
        }]
    });
}(window,nbrut);