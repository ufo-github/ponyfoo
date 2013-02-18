!function (window,$,nbrut,undefined) {
    function afterActivate(viewModel, data, ctx){
        var dialog = ctx.elements;

        dialog.center().hide().fadeIn();
    }

    nbrut.tt.configure({
        key: 'validation-dialog',
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);