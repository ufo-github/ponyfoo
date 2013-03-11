!function (window,$,nbrut) {
    'use strict';

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

        nbrut.ui.pagedTable({
            what: 'discussion',
            friendlyName: 'discussions',
            legend: 'Load older discussions',
            partial: 'discussion-rows',
            paging: viewModel.paging,
            table: table
        });
	}

    nbrut.tt.configure({
        key: 'blogger-discussions',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);