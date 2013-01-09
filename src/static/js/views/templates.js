!function (window,nbrut) {
    nbrut.tt.register({
        key: '404',
        source: '#not-found-template'
    });

    nbrut.tt.register({
        key: 'loader',
        source: '#loader-template'
    });

    var homeTitle = { value: 'Pony Foo', formatted: false };


    function getEntryRoute(regex){
        return {
            regex: regex,
            get: function(data){
                return '/{0}'.format(data.query);
            },
            map: function(captures){
                return { query: captures.slice(1).join('/') };
            }
        }
    }

    nbrut.tt.register({
        key: 'home',
        source: '#blog-entries-template',
        mustache: true,
        aliases: [{
            title: homeTitle,
            route: '/',
            trigger: '#home'
        },{
            key: 'year',
            title: homeTitle,
            route: getEntryRoute(/^\/([0-9]{4})\/?$/i)
        },{
            key: 'month',
            title: homeTitle,
            route: getEntryRoute(/^\/([0-9]{4})\/(0[1-9]|1[0-2])\/?$/i)
        },{
            key: 'day',
            title: homeTitle,
            route: getEntryRoute(/^\/([0-9]{4})\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/?$/i)
        }]
    });

    nbrut.tt.register({
        key: 'entry',
        source: '#blog-entry-template',
        mustache: true,
        aliases: [{
            title: homeTitle, // TODO: set title
            route: getEntryRoute(/^\/([0-9]{4})\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/([a-z0-9\-]+)$/i)
        }]
    });

    nbrut.tt.register({
        key: 'entry-editor',
        source: '#entry-editor-template',
        mustache: true,
		back: '#cancel-entry',
        aliases: [{
            title: { value: 'New Post' },
            route: '/author/entry',
            trigger: '#write-entry'
        }, {
            key: 'edit',
            title: { value: 'Edit Post' },
            route: {
                regex: /^\/author\/entry\/([0-9a-f]+)$/i,
                get: function(data){
                    return '/author/entry/{0}'.format(data.id);
                },
                map: function(captures){
                    return { id: captures[1] };
                }
            }
        }]
    });

    nbrut.tt.register({
        key: 'entry-review',
        source: '#entry-review-template',
        mustache: true,
        aliases: [{
            title: { value: 'All Posts' },
            route: '/author/entry/list',
            trigger: '#review-entries'
        }]
    });
}(window,nbrut);