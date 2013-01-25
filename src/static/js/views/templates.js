!function (window,nbrut,moment) {
    nbrut.tt.register({
        key: '404',
        source: '#not-found-template',
        title: 'Not Found'
    });

    function getEntryRoute(regex){
        return {
            regex: new RegExp(regex, 'i'),
            get: function(data){
                return '/{0}'.format(data.query);
            },
            map: function(captures){
                return { query: captures.slice(1).join('/') };
            }
        }
    }

    var year = '^\/([0-9]{4})\/',
        month = year + '(0[1-9]|1[0-2])\/',
        day = month + '(0[1-9]|[12][0-9]|3[01])\/',
        slug = day + '([a-z0-9\-]+)';

    nbrut.tt.register({
        key: 'home',
        source: '#blog-entries-template',
        mustache: true,
        aliases: [{
            title: { text: nbrut.site.title, literal: true },
            route: '/',
            trigger: '#home'
        },{
            key: 'year',
            title: function(viewModel, data){
                var year = parseInt(data.query, 10) + 1; // raw years are zero-based in momentjs
                return moment(year.toString()).format(moment.yearFormat);
            },
            route: getEntryRoute(year + '?$')
        },{
            key: 'month',
            title: function(viewModel, data){
                return moment(data.query).format(moment.monthFormat);
            },
            route: getEntryRoute(month + '?$')
        },{
            key: 'day',
            title: function(viewModel, data){
                return moment(data.query).format(moment.dayFormat);
            },
            route: getEntryRoute(day + '?$')
        },{
            key: 'one',
            title: function(viewModel){ // always exactly one single entry.
                return viewModel.entries[0].title;
            },
            route: getEntryRoute(slug + '$')
        }]
    });

    nbrut.tt.register({
        key: 'empty-entry',
        source: '#empty-entry-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'entry-pager',
        source: '#entry-pager-template',
        mustache: true
    });
}(window,nbrut,moment);