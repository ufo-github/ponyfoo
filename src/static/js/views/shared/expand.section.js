!function (window,$,nbrut,undefined) {
    function afterActivate(viewModel, data, ctx){
        var elements = ctx.elements;
        elements.find('.expand').on('click.expand', function(){
            viewModel.target.fadeIn();
            elements.remove();
        });
    }

    nbrut.tt.configure({
        key: 'expand-section',
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);