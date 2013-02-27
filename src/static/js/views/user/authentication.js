!function (window,$,nbrut, undefined) {
    var ignored = ['/user/login','/user/register'],
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

        if (prev !== undefined){
            var providers = ctx.elements.find('.authentication-provider-links a');
            providers.each(function(){
                var provider = $(this),
                    attr = 'href',
                    href = provider.attr(attr);

                provider.attr(attr, '{0}?redirect={1}'.format(href, prev));
            });
        }
	}
	
    nbrut.tt.configure({
        key: 'user-register',
        prepare: prepare,
		afterActivate: afterActivate
    });

    nbrut.tt.configure({
        key: 'user-login',
        prepare: prepare,
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);