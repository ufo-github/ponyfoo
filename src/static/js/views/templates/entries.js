!function (window, nbrut, moment, undefined) {
    var year = '^\/([0-9]{4})\/',
        month = year + '(0[1-9]|1[0-2])\/',
        day = month + '(0[1-9]|[12][0-9]|3[01])\/',
        slug = day + '([a-z0-9\-]+)',
        comments = slug + '(#comments)',
        commentThread = slug + '(#thread-[a-z0-9\-]+)';

    function getEntryRoute(regex){
        var searching = regex.indexOf('\/search') === 0,
            hashed = regex.indexOf('#') !== -1,
            prefix = searching ? 'search/' : '';

        return {
            regex: new RegExp(regex),
            get: function(data){
                var sanitized = data.query.replace(/ /g,'+');
                return '/{0}{1}'.format(sanitized, data.hash || '');
            },
            map: function(captures){
                var hash = hashed ? captures.pop() : undefined,
                    terms = captures.slice(1).join('/'),
                    decoded = decodeURIComponent(terms).replace(/\+/g,' ');

                return {
                    query: prefix + decoded,
                    terms: decoded,
                    hash: hash,
                    search: searching
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
            route: getEntryRoute(comments + '$')
        },{
            key: 'one-comment-thread',
            title: oneTitle,
            route: getEntryRoute(commentThread + '$')
        },{
            key: 'search',
            title: function(viewModel,data){
                var tagged = 'tagged/',
                    tags = data.terms.indexOf(tagged) === 0,
                    terms = tags ? data.terms.substr(tagged.length) : data.terms,
                    prefix = tags ? 'Search tagged' : 'Search';

                return '{0} "{1}"'.format(prefix, terms);
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