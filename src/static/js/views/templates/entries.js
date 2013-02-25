!function (window, nbrut, moment, undefined) {
    var year = '^\/([0-9]{4})\/',
        month = year + '(0[1-9]|1[0-2])\/',
        day = month + '(0[1-9]|[12][0-9]|3[01])\/',
        slug = day + '([a-z0-9\-]+)',
        commentsHash = '#comments',
        commentsSection = slug + '(?:{0})'.format(commentsHash);

    function getEntryRoute(regex){
        var searching = regex.indexOf('\/search') === 0,
            comments = regex.indexOf(commentsHash) !== -1,
            prefix = searching ? 'search/' : '',
            hash = comments ? commentsHash : undefined;

        return {
            regex: new RegExp(regex),
            get: function(data){
                var sanitized = data.query.replace(/ /g,'+');
                return '/{0}{1}'.format(sanitized, hash || '');
            },
            map: function(captures){
                var terms = captures.slice(1).join('/'),
                    decoded = decodeURIComponent(terms).replace(/\+/g,' ');

                return {
                    query: prefix + decoded,
                    terms: decoded,
                    hash: hash
                };
            }
        };
    }

    function oneTitle(viewModel){ // always exactly one single entry.
        return viewModel.entries[0].title;
    }

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
            title: oneTitle,
            route: getEntryRoute(slug + '$')
        },{
            key: 'one-comments',
            title: oneTitle,
            route: getEntryRoute(commentsSection + '$')
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

    nbrut.tt.register({
        key: 'discussion-list',
        source: '#discussion-list-template',
        mustache: true
    });
}(window,nbrut,moment);