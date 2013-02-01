!function (window,nbrut,moment) {
    function getEntryRoute(regex){
        var searching = regex.indexOf('\/search') === 0,
            prefix = searching ? 'search/' : '';

        return {
            regex: new RegExp(regex, 'i'),
            get: function(data){
                return '/{0}'.format(data.query.replace(/ /g,'+'));
            },
            map: function(captures){
                var terms = captures.slice(1).join('/'),
                    decoded = decodeURIComponent(terms).replace(/\+/g,' ');

                return {
                    query: prefix + decoded,
                    terms: decoded
                };
            }
        };
    }

    var year = '^\/([0-9]{4})\/',
        month = year + '(0[1-9]|1[0-2])\/',
        day = month + '(0[1-9]|[12][0-9]|3[01])\/',
        slug = day + '([a-z0-9\-]+)(?:\/comments)?';

    nbrut.tt.register({
        key: 'home',
        source: '#blog-entries-template',
        mustache: true,
        aliases: [{
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
        },{
            key: 'search',
            title: function(viewModel,data){
                return 'Search "' + data.terms + '"';
            },
            route: getEntryRoute('\/search\/(.*)')
        }]
    });

    nbrut.tt.register({
        key: 'empty-entry',
        source: '#empty-entry-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'exhausted-entries',
        source: '#exhausted-entries-template'
    });

    nbrut.tt.register({
        key: 'entry-pager',
        source: '#entry-pager-template'
    });

    nbrut.tt.register({
        key: 'more-entries',
        source: '#more-entries-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'entry-siblings',
        source: '#entry-siblings-template',
        mustache: true
    });
}(window,nbrut,moment);