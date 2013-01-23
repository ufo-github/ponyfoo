!function (window,nbrut) {
    nbrut.tt.register({
        key: '404',
        source: '#not-found-template'
    });

    nbrut.tt.register({
        key: 'loader',
        source: '#loader-template'
    });

    var homeTitle = { value: nbrut.site.title, literal: true };

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
        },{
            key: 'one',
            title: {
                dynamic: function(viewModel){ // always exactly a single entry.
                    return viewModel.entries[0].title;
                }
            },
            route: getEntryRoute(/^\/([0-9]{4})\/(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/([a-z0-9\-]+)$/i)
        }]
    });
}(window,nbrut);