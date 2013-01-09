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

    nbrut.tt.register({
        key: 'home',
        source: '#blog-template',
        mustache: true,
        aliases: [{
            title: homeTitle,
            route: '/',
            trigger: '#home'
        },{
            key: 'year',
            title: homeTitle,
            route: {
                regex: /^\/([0-9]{4})\/?$/i,
                get: function(data){
                    return '/{0}'.format(data.year);
                },
                map: function(captures){
                    return {
                        query: captures[1],
                        year: captures[1]
                    };
                }
            }
        },{
            key: 'month',
            title: homeTitle,
            route: {
                regex: /^\/([0-9]{4})\/(0[1-9]|1[0-2])\/?$/i,
                get: function(data){
                    return '/{0}/{1}'.format(data.year, data.month);
                },
                map: function(captures){
                    return {
                        query: '{0}/{1}'.format(captures[1], captures[2]),
                        year: captures[1],
                        month: captures[2]
                    };
                }
            }
        },{
            key: 'day',
            title: homeTitle,
            route: {
                regex: /^\/([0-9]{4})\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/?$/i,
                get: function(data){
                    return '/{0}/{1}/{2}'.format(data.year, data.month, data.day);
                },
                map: function(captures){
                    return {
                        query: '{0}/{1}/{2}'.format(captures[1], captures[2], captures[3]),
                        year: captures[1],
                        month: captures[2],
                        day: captures[3]
                    };
                }
            }
        }]
    });

    nbrut.tt.register({
        key: 'entry-editor',
        source: '#entry-template',
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