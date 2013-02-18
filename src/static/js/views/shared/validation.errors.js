!function (window,$,nbrut,undefined) {
    function afterActivate(viewModel, data, ctx){
        var validation = ctx.elements,
            close = validation.find('.validation-close');

        close.on('click', function(){
            validation.fadeOutAndRemove();
        });
    }

    nbrut.tt.configure({
        key: 'validation-errors',
        afterActivate: afterActivate
    })
}(window,jQuery,nbrut);