!function (window,$,nbrut) {
    function prepare(render){
        nbrut.thin.get('discussion', {
            context: 'prepare',
            done: function(it){
                render(it);
            }
        });
    }

	function afterActivate(viewModel, data, ctx){
        var table = ctx.elements.filter('.discussion-table');
console.log(viewModel);
        nbrut.ui.pagedTable({
            what: 'discussion',
            friendlyName: 'discussions',
            legend: 'Load older discussions',
            partial: 'discussion-rows',
            paging: viewModel.paging,
            table: table,
            then: prettify
        });

        prettify(table);
	}

    function prettify(container){
        var code = container.find('.comment');
        nbrut.md.prettify(code);
    }

    nbrut.tt.configure({
        key: 'blogger-discussions',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);