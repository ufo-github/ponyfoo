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
        var errors = viewModel.flash.error;
        if (errors !== undefined && errors.length !== 0){
            var validation = nbrut.tt.partial('validation-errors', {
                errors: errors
            });
            validation.insertBefore('.authentication-providers');
        }

        




        // TODO! stuff!!!!!!





        var info = viewModel.flash.info;
        if (info !== undefined && info.length !== 0){
            var partial = nbrut.tt.partial('validation-success', {
                info: info
            });
            partial.insertBefore('.authentication-providers');
        }


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
	}

    nbrut.tt.configure({
        key: 'user-login',
        prepare: prepare,
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);