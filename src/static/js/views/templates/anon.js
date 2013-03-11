!function (window,nbrut) {
    var register = nbrut.tt.register;

    register({
        key: 'user-register',
        source: '#user-register-template',
        mustache: true,
        aliases: [{
            title: 'Register',
            route: '/user/register',
            trigger: '#register-user'
        }]
    });

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
}(window,nbrut);