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
            var empty = nbrut.tt.partial('empty-entry', viewModel);
            empty.fill(container);
        }

        nbrut.md.prettify(container);

        pager(viewModel, data);
        sidebar();
	}

    function pager(viewModel, data){
        if(viewModel.paging === undefined || viewModel.paging.next === false){
            return;
        }

        var query = data.query ? data.query + '/' : '',
            page = '{0}p/{1}'.format(query, viewModel.paging.next),
            wrapper = $('.blog-entries-wrapper'),
            partial = nbrut.tt.partial('entry-pager', { next: page });

        partial.appendTo(wrapper);

        var win = $(window),
            pager = $('.blog-pager'),
            card = pager.find('.flip-card');

        win.on('scroll.paging', function(){
            var allowance = 80,
                target = pager.position().top + pager.height() - allowance,
                y = win.scrollTop() + win.height();

            if (y > target){
                more();
            }
        });

        pager.on('click.paging', more);

        function more(){
            win.off('scroll.paging');
            pager.off('click.paging');

            if(!card.hasClass('flipped')){
                card.addClass('flipped');

                // TODO
                // fetch/then:
                // append posts
                // remove pager
                // add new pager where necessary
            }
        }
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