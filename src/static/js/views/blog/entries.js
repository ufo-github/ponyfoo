!function (window,$,nbrut,undefined) {
    function prepare(render, data){
        if (data.query === undefined){
            complete(render, data);
        }else{
            nbrut.thin.get('entry', {
                context: 'prepare',
                done: function(it){
                    complete(render, data, it.entries)
                }
            });
        }
    }

    function complete(render, data, latest){
        nbrut.thin.get('entry', {
            id: data.query,
            context: 'prepare',
            done: function(it){
                render({
                    entries: it.entries || [it.entry],
                    paging: it.paging,
                    latest: latest || it.entries
                }, it.entry === null);
            }
        });
    }

    function afterActivate(viewModel, data, ctx){
        var container = $('.blog-entries'),
            count = viewModel.entries.length;

        if(data.search){
            container.find('.blog-entry-text').each(function(){
                var self = $(this).hide(),
                    expand = nbrut.tt.partial('expand-section', {
                        target: self,
                        legend: 'Click to reveal the rest of this post'
                    });

                expand.insertBefore(self);
            });
        }

        if (count === 0){
            var empty = nbrut.tt.partial('empty-entry', viewModel);
            empty.fill(container);
        }else if(count !== 1){
            addPager(viewModel, ctx.identifier, data.query || '');
        }

        if(count === 1){
            var entry = viewModel.entries[0],
                model = entry.related,
                siblings = nbrut.tt.partial('entry-siblings', model),
                footer = container.find('.blog-entry-footer');

            siblings.appendTo(footer);
            addComments(entry, data);
        }

        addSidebar();
    }

    function addExhausted(){
        var container = $('.blog-entries'),
            exhausted = nbrut.tt.partial('exhausted-entries');

        exhausted.appendTo(container);
    }

    function addPager(viewModel, identifier, query){
        if(viewModel.paging.next === false){
            addExhausted();
            return;
        }

        var page = '{0}p/{1}'.format(query.length === 0 ? '' : '/', viewModel.paging.next),
            container = $('.blog-entries'),
            paging = nbrut.tt.partial('entry-pager'),
            win = $(window),
            pager = paging.appendTo(container);

        function more(){
            win.off('scroll.paging');
            pager.off('click.paging');
            pagingEvent(identifier, pager, query, page);
        }

        win.on('scroll.paging', function(){
            setTimeout(function(){ // sanity. allow scrolling event to finish.
                if(win.width() < nbrut.ui.breaks.medium.width){
                    return;
                }

                var allowance = 80,
                    target = pager.position().top + pager.height() - allowance,
                    y = win.scrollTop() + win.height();

                if (y > target){
                    more();
                }
            },0);
        });

        pager.on('click.paging', more);
    }

    function pagingEvent(identifier,pager,query,page){
        var card = pager.find('.flip-card');

        if(nbrut.tt.active !== identifier){ // sanity
            return;
        }

        card.flip(true);

        nbrut.thin.get('entry', {
            id: query + page,
            done: function(it){
                if(nbrut.tt.active !== identifier){ // sanity
                    return;
                }

                var container = $('.blog-entries'),
                    articles = nbrut.tt.partial('more-entries', it);

                articles.appendTo(container);
                pager.remove();
                addPager(it, identifier, query);
            }
        });
    }

    function addSidebar(){
        var flipper = $('.sidebar-flipper'),
            card = $('.blog-sidebar .flip-card'),
            highlight = 'box-highlight',
            highlightSidebar = 'sidebar-flip-highlight',
            highlighted = nbrut.local.get(highlightSidebar, true);

        if(highlighted === true){ // only when the user doesn't know about it.
            flipper.addClass(highlight);
        }

        flipper.on('click.flip', function(){
            card.flip();
            flipper.removeClass(highlight);
            nbrut.local.set(highlightSidebar, false);
        });
    }

    function addComments(entry, data){
        var container = $('.blog-entries');
        container.find('.comment-count').remove(); // these are just for the list view

        nbrut.thin.get('comment', {
            parent: {
                what: 'entry',
                id: entry._id
            },
            done: function(it){
                var list = nbrut.tt.partial('discussion-list', it),
                    discussions = list.appendTo(container), actions;

                if(nbrut.locals.connected){
                    actions = nbrut.tt.partial('discussion-actions', { entryId: entry._id });
                    actions.appendTo(discussions);

                    discussions.find('.blog-discussion').each(function(){
                        var self = $(this),
                            model = { id: self.data('id') },
                            reply = nbrut.tt.partial('discussion-reply', model);

                        reply.appendTo(self);
                    });
                }else{
                    authenticate = nbrut.tt.partial('authentication', { action: 'post a comment' });
                    authenticate.appendTo(discussions);
                }

                if (data.hash !== undefined){ // hashes target comment anchors
                    discussions.find(data.hash).scrollIntoView();
                }
            }
        });
    }

    nbrut.tt.configure({
        key: 'home',
        prepare: prepare,
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);