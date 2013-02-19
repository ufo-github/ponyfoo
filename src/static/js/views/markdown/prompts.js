!function (window,$,nbrut,undefined) {
    function afterActivate(viewModel, data, ctx){
        var dialog = ctx.elements,
            input = dialog.find('.prompt-input');

        dialog.find('.ok-button').on('click', ok);
        input.on('keydown', function(e){
            if(e.which === 13){
                ok();
                return false;
            }
        });

        function ok(){
            dialog.trigger('container.close');
            var text = input.val();
            viewModel.complete(text);
        }
    }

    nbrut.tt.configure({
        key: 'prompt-link',
        afterActivate: afterActivate
    });

    nbrut.tt.configure({
        key: 'prompt-image',
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);