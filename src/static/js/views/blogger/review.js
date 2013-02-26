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

        bindPager(table, viewModel, '');
	}

    function bindPager(table, viewModel, query){
        if(viewModel.paging.next === false){
            return;
        }

        var page = 'p/' + viewModel.paging.next,
            partial = nbrut.tt.partial('entry-review-pager'),
            pager = partial.insertAfter(table),
            link = pager.find('a');

        link.one('click.paging', function(){
            link.text('Loading...').css({ cursor: 'wait' });

            nbrut.thin.get('entry', {
                id: query + page,
                done: function(it){
                    var tbody = table.find('tbody'),
                        partial = nbrut.tt.partial('entry-review-list', it),
                        rows = partial.appendTo(tbody);

                    rows.find('tr:first').addClass('entry-row-separator');
                    rows.children().unwrap(); // remove the tbody that comes with the partial
                    pager.remove();
                    bindPager(table, it, query);
                }
            });
        });
    }
	
    nbrut.tt.configure({
        key: 'entry-review',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);