!function (window, nbrut, moment, undefined) {
    var register = nbrut.tt.register,
        year = '^\/([0-9]{4})\/',
        month = year + '(0[1-9]|1[0-2])\/',
        day = month + '(0[1-9]|[12][0-9]|3[01])\/',
        slug = day + '([a-z0-9\-]+)',
        comments = slug + '(#comments)',
        commentThread = slug + '(#thread-[a-z0-9\-]+)';

    function extractTags(terms){
        var tagged = 'tagged/',
            decoded = decodeURIComponent(terms).replace(/\+/g,' '),
            tagSearch = decoded.indexOf(tagged) === 0,
            tags = tagSearch ? decoded.substr(tagged.length) : decoded;

        return {
            tagged: tagSearch,
            tags: tags === decoded ? null : tags,
            terms: decoded
        };
    }

    function getEntryRoute(regex){
        var searching = regex.indexOf('\/search') === 0,
            slugged = regex.indexOf(slug) === 0,
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
                    extracted = extractTags(terms);

                return {
                    query: prefix + extracted.terms,
                    terms: extracted.terms,
                    hash: hash,
                    search: searching,
                    tags: extracted.tags,
                    slug: slugged
                };
            }
        };
    }

    function oneTitle(viewModel){ // always exactly one single entry.
        return viewModel.entries[0].title;
    }

    register({
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
                var terms = data.terms,
                    extracted = extractTags(terms),
                    prefix = extracted.tagged ? 'Search tagged' : 'Search',
                    keywords = extracted.tagged ? extracted.tags : extracted.terms;

                return '{0} "{1}"'.format(prefix, keywords);
            },
            route: getEntryRoute('\/search\/(.*)')
        }]
    });

    register({
        key: 'empty-entry',
        source: '#empty-entry-template',
        mustache: true
    });

    register({
        key: 'exhausted-entries',
        source: '#exhausted-entries-template'
    });

    register({
        key: 'entry-pager',
        source: '#entry-pager-template'
    });

    register({
        key: 'more-entries',
        source: '#more-entries-template',
        mustache: true
    });

    register({
        key: 'entry-siblings',
        source: '#entry-siblings-template',
        mustache: true
    });

    register({
        key: 'discussion-list',
        source: '#discussion-list-template',
        mustache: true
    });
}(window,nbrut,moment);