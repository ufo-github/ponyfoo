!function (window,$,nbrut,undefined) {
    function afterActivate(viewModel, data, ctx){
        bindPager(ctx.elements, viewModel, viewModel.paging, viewModel.query || '');
    }

    function bindPager(container, viewModel, paging, query){
        var page = 'p/' + paging.next,
            link = container.find('a');

        link.one('click.paging', function(){
            var table = viewModel.table,
                loading = 'Loading {0}...'.format(viewModel.friendlyName);

            link.text(loading).css({ cursor: 'wait' });

            nbrut.thin.get(viewModel.what, {
                id: query + page,
                context: table,
                done: function(it){
                    var tbody = table.find('tbody'),
                        partial = nbrut.tt.partial(viewModel.partial, it),
                        appended = partial.appendTo(tbody),
                        rows = appended.children();

                    rows.first().addClass('table-page-separator');
                    rows.unwrap(); // remove the tbody that comes with the partial
                    container.remove();

                    (viewModel.then || $.noop)(rows);

                    bindNextPager(viewModel, it.paging);
                }
            });
        });
    }

    function bindNextPager(viewModel, paging){
        if(paging.next === false){
            return;
        }

        viewModel.paging = paging;

        var partial = nbrut.tt.partial('table-pager', viewModel);
        partial.insertAfter(viewModel.table);
    }

    nbrut.tt.configure({
        key: 'table-pager',
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);