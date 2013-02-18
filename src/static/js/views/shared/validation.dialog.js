!function (window,$,nbrut,undefined) {
    function afterActivate(viewModel, data, ctx){
        var dialog = ctx.elements,
            ok = dialog.find('.ok-button');

        dialog.center().hide().fadeIn();
        ok.on('click', function(){
            dialog.fadeOutAndRemove();
        });
    }

    nbrut.tt.configure({
        key: 'validation-dialog',
        afterActivate: afterActivate
    })
}(window,jQuery,nbrut);