!function (window,nbrut) {
    nbrut.tt.register({
        key: 'user-register',
        source: '#user-register-template',
        aliases: [{
            title: 'Register',
            route: '/user/register',
            trigger: '#register-user'
        }]
    });

    nbrut.tt.register({
        key: 'user-login',
        source: '#user-login-template',
        aliases: [{
            title: 'Login',
            route: '/user/login',
            trigger: '#login-user'
        }]
    });

    nbrut.tt.register({
        key: 'authentication',
        source: '#authentication-required-template',
        mustache: true
    });
}(window,nbrut);