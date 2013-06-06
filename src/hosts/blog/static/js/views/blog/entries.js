!function (window,$,nbrut,undefined) {
    'use strict';

    function prepare(render, data){
        if (data.query === undefined){
            complete(render, data);
        }else{
            nbrut.thin.get('entry', {
                context: 'prepare',
                done: function(it){
                    complete(render, data, it.entries);
                }
            });
        }
    }

    function complete(render, data, latest){
        nbrut.thin.get('entry', {
            id: data.query,
            context: 'prepare',
            done: function(it){
                var viewModel = getViewModel(it, latest, data);
                render(viewModel, it.entry === null);
            }
        });
    }

    function getViewModel(it, latest, data){
        var viewModel = {
            entries: it.entries || [it.entry],
            paging: it.paging,
            latest: latest || it.entries
        };

        return addMeta(viewModel, data);
    }

    function addMeta(viewModel, data){
        var meta = {};

        if(data.search){
            if(data.tags){
                viewModel.emptyText = 'No posts tagged "{0}" found'.format(data.tags);
                meta.title = 'Posts tagged "{0}".'.format(data.tags);
            }else{
                viewModel.emptyText = 'No posts matching "{0}" found'.format(data.terms);
                meta.title = 'Posts filtered by "{0}".'.format(data.terms);
            }

            meta.description = viewModel.emptyText;
        }else if(data.query === undefined){ // home page
            meta.title = null; // no prefix.
        }else if(!data.slug){ // search by date
            meta.title = 'Posts filtered by date.';
        }

        viewModel.meta = meta;
        return viewModel;
    }

    function afterActivate(viewModel, data, ctx){
        var flashValidation = nbrut.directives('flash-validation'),
            elements = ctx.elements,
            container = elements.find('.blog-entries'),
            search = !!data.search,
            empty;

        switch(viewModel.entries.length){
            case 0:
                empty = nbrut.tt.partial('empty-entry', viewModel);
                empty.fill(container);
                break;
            case 1:
                addSingleEntryPartials(viewModel, container, data);
                break;
            default:
                addPager(viewModel, container, ctx.identifier, data.query || '');
        }

        if(search){
            addSearchShrinkage(container);
        }
        addReadingTime(container);
        wireSubscriptionButton();

        flashValidation(viewModel, '.blog-entries-wrapper');
    }

    function addSearchShrinkage(container){
        container.find('.blog-entry-text').each(function(){
            var self = $(this).hide(),
                expand = nbrut.tt.partial('expand-section', {
                    target: self,
                    legend: 'Click to reveal the rest of this post'
                });

            expand.insertBefore(self);
        });
    }

    function addReadingTime(container){
        var entries = container.find('.blog-entry'),
            readingTime = entries.readingTime();

        container.data('readingTime', readingTime);
    }

    function addSingleEntryPartials(viewModel, container, data){
        var entry = viewModel.entries[0],
            model = entry.related,
            siblings = nbrut.tt.partial('entry-siblings', model),
            footer = container.find('.blog-entry-footer');

        siblings.appendTo(footer);
        addComments(container, entry, data);
    }

    function addExhausted(container){
        var exhausted = nbrut.tt.partial('exhausted-entries');
        exhausted.appendTo(container);
    }

    function addPager(viewModel, container, identifier, query){
        if(viewModel.paging.next === false){
            addExhausted(container);
            return;
        }

        var page = '{0}p/{1}'.format(query.length === 0 ? '' : '/', viewModel.paging.next),
            paging = nbrut.tt.partial('entry-pager'),
            win = $(window),
            pager = paging.appendTo(container);

        function more(){
            win.off('scroll.paging');
            pager.off('click.paging');
            pagingEvent(container, identifier, pager, query, page);
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
            }, 0);
        });

        pager.on('click.paging', more);
    }

    function pagingEvent(container, identifier, pager, query, page){
        var card = pager.find('.flip-card');

        if(nbrut.tt.getActive() !== identifier){ // sanity
            return;
        }

        card.flip(true);

        nbrut.thin.get('entry', {
            id: query + page,
            done: function(it){
                if(nbrut.tt.getActive() !== identifier){ // sanity
                    return;
                }
                var articles = nbrut.tt.partial('more-entries', it);
                articles.appendTo(container);
                pager.remove();
                addPager(it, container, identifier, query);
            }
        });
    }

    function addComments(container, entry, data){
        container.find('.comment-count').remove(); // these are just for the list view

        nbrut.thin.get('comment', {
            parent: {
                what: 'entry',
                id: entry._id
            },
            done: function(it){
                var list = nbrut.tt.partial('discussion-list', it),
                    discussions = list.appendTo(container), actions, anchor, authenticate;

                if(window.locals.connected){
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
                    anchor = discussions.find(data.hash);
                    anchor.scrollIntoView({
                        offset: -30,
                        then: function(){
                            anchor.flash('#ffc');
                        }
                    });
                }
            }
        });
    }

    function unload(container){
        var entries = container.find('.blog-entries'),
            readingTime = entries.data('readingTime');

        if (readingTime){
            readingTime.destroy();
        }
    }

    function wireSubscriptionButton(){
        var container = $('.email-subscriptions-form'),
            input = container.find('.email-subscription-input'),
            button = container.find('.email-subscription');

        button.on('click', function(){
            nbrut.ui.disable(button);
            nbrut.thin.post('/email/subscribe', {
                api: false,
                data: input.length ? {
                    email: input.val()
                } : null,
                context: container,
                done: function(){
                    button.text('Subscribed!');
                },
                fail: function(){
                    nbrut.ui.enable(button);
                }
            });
        });
    }

    nbrut.tt.configure({
        key: 'home',
        prepare: prepare,
        afterActivate: afterActivate,
        unload: unload
    });
}(window,jQuery,nbrut);