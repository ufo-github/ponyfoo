!function (window,$,nbrut,undefined) {
    function afterActivateList(viewModel, data, ctx){
        nbrut.md.prettify(ctx.elements);
    }

    nbrut.tt.configure({
        key: 'discussion-list',
        afterActivate: afterActivateList
    });
}(window,jQuery,nbrut);