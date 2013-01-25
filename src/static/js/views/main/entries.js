!function (window,$,nbrut,undefined) {
	function prepare(render, data){
        if (data.query === undefined){
            complete(render, data);
        }else{
            nbrut.thin.get('entry', {
                then: function(it){
                    complete(render, data, it.entries)
                }
            });
        }
	}

    function complete(render, data, latest){
        nbrut.thin.get('entry', {
            id: data.query,
            then: function(it){
                render({
                    entries: it.entries || [it.entry],
                    paging: it.paging,
                    latest: latest || it.entries
                }, it.entry === null);
            }
        });
    }
	
	function afterActivate(viewModel, data){
		var container = $('.blog-entries');

        if(viewModel.entries.length === 0){
            var empty = nbrut.tt.partial('empty-entry', { title: viewModel.title });
            empty.fill(container);
        }

        if(viewModel.paging !== undefined && viewModel.paging.next !== false){
            var query = data.query ? data.query + '/' : '',
                page = '{0}p/{1}'.format(query, viewModel.paging.next),
                wrapper = $('.blog-entries-wrapper'),
                pager = nbrut.tt.partial('entry-pager', { next: page });

            pager.appendTo(wrapper);
        }

        nbrut.md.prettify(container);

        sidebar();
	}

    function sidebar(){
        var flipper = $('.sidebar-flipper'),
            card = $('.blog-sidebar .flip-card'),
            highlight = 'box-highlight',
            highlightSidebar = 'sidebar-flip-highlight',
            highlighted = nbrut.local.get(highlightSidebar, true);

        if(highlighted === true){ // only when the user doesn't know about it.
            flipper.addClass(highlight);
        }

        flipper.on('click.flip', function(){
            card.toggleClass('flipped');
            flipper.removeClass(highlight);
            nbrut.local.set(highlightSidebar, false);
        });
    }
	
    nbrut.tt.configure({
        key: 'home',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);