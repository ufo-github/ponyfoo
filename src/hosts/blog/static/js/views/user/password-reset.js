!function (window,$,nbrut, undefined) {
    'use strict';

    function afterActivate(viewModel){
        var action = '/user/reset-password/' + viewModel.tokenId,
            input = $('.js-password-reset');

        $('#lala').on('click', function(){
            nbrut.thin.post(action, {
                api: false,
                data: {
                    password: input.val()
                },
                context: input
            });
        });
    }

    nbrut.tt.configure({
        key: 'user-password-reset',
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);