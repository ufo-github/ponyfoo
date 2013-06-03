!function (window,$,nbrut, undefined) {
    'use strict';

    var ignored = ['/','/user/login'],
        prev;

    function prepare(render, data, ctx){
        if($.inArray(ctx.prev, ignored) === -1){
            prev = ctx.prev;
        }
        render({ prev: prev });
    }

	function afterActivate(viewModel, data, ctx){
        var flashValidation = nbrut.directives('flash-validation');
        flashValidation(viewModel, '.authentication-providers');

        if (prev !== undefined){
            var providers = ctx.elements.find('.authentication-providers .social');
            providers.each(function(){
                var provider = $(this),
                    attr = 'href',
                    href = provider.attr(attr);

                provider.attr(attr, '{0}?redirect={1}'.format(href, prev));
            });
        }

        var create = $('#create-account'),
            submit = $('.authentication-button');

        create.on('change', function(){
            var checked = create.prop('checked');
            if (checked){
                submit.val('Register');
            }else{
                submit.val('Login');
            }
        });

        $('.password-reset').on('click', function(){
            nbrut.thin.post('/user/request-password-reset', {
                api: false,
                data: {
                    email: $('#login-email').val()
                }
            });
        });
	}

    nbrut.tt.configure({
        key: 'user-login',
        prepare: prepare,
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);