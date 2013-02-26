!function (window,$,nbrut) {
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
            table = elements.find('.entry-review-table');

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

        bindPager(elements);
	}

    function bindPager(table, viewModel){
        if(viewModel.paging.next === false){
            return;
        }

        var page = 'p/' + viewModel.paging.next,
            partial = nbrut.tt.partial('entry-review-pager'),
            pager = partial.insertAfter(table),
            link = pager.find('a');

        link.one('click.paging', function(){
            // TODO take stuff from entries.js
        });
    }
	
    nbrut.tt.configure({
        key: 'entry-review',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);