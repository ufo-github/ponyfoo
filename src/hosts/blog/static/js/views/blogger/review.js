!function (window,$,nbrut) {
    'use strict';

    function prepare(render){
        nbrut.thin.get('entry', {
            context: 'prepare',
            done: function(it){
                render(it);
            }
        });
    }

	function afterActivate(viewModel, data, ctx){
        var elements = ctx.elements,
            table = elements.filter('.entry-review-table');

        table.find('.entry-row').each(function(){
			var row = $(this),
				id = row.data('id');

			row.find('.remove').on('click.remove', function(){
                nbrut.thin.del('entry', {
                    id: id,
                    context: table,
                    done: function(){
                        row.fadeOutAndRemove();
                    }
                });
			});
		});

        nbrut.ui.pagedTable({
            what: 'entry',
            friendlyName: 'entries',
            legend: 'Review older',
            partial: 'entry-review-list',
            paging: viewModel.paging,
            table: table
        });
	}
	
    nbrut.tt.configure({
        key: 'entry-review',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);