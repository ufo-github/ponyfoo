!function (window,nbrut) {
    nbrut.tt.register({
        key: '404',
        source: '#not-found-template'
    });

    nbrut.tt.register({
        key: 'loader',
        source: '#loader-template'
    });

    nbrut.tt.register({
        key: 'home',
        source: '#blog-template',
        mustache: true,
        aliases: [{
            title: { value: 'Pony Foo', formatted: false },
            route: '/',
            trigger: '#home'
        }]
    });

    nbrut.tt.register({
        key: 'entry-editor',
        source: '#entry-template',
        mustache: true,
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