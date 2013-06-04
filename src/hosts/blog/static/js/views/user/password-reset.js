!function (window,$,nbrut, undefined) {
    'use strict';

    function afterActivate(viewModel, data){
        var action = '/user/reset-password/' + data.tokenId,
            input = $('.js-password-reset');

        $('.js-password-reset-button').on('click', function(){
            nbrut.thin.post(action, {
                api: false,
                data: {
                    password: input.val()
                },
                context: $('.js-password-reset-area')
            });
        });

        input.focus();
    }

    nbrut.tt.configure({
        key: 'user-password-reset',
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);