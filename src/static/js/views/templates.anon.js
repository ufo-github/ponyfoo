!function (window,nbrut) {
    nbrut.tt.register({
        key: 'user-register',
        source: '#user-register-template',
        aliases: [{
            title: 'Register',
            route: '/user/register'
        }]
    });

    nbrut.tt.register({
        key: 'user-login',
        source: '#user-login-template',
        aliases: [{
            title: 'Login',
            route: '/user/login'
        }]
    });
}(window,nbrut);