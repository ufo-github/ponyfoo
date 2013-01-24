!function (window,nbrut,moment) {
    nbrut.tt.register({
        key: '404',
        source: '#not-found-template',
        title: { value: 'Not Found' }
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
            title: {
                dynamic: function(viewModel, data){ // always exactly a single entry.
                    var year = parseInt(data.query, 10) + 1; // raw years are zero-based in momentjs
                    return moment(year.toString()).format(moment.yearFormat);
                }
            },
            route: getEntryRoute(/^\/([0-9]{4})\/?$/i)
        },{
            key: 'month',
            title: {
                dynamic: function(viewModel, data){ // always exactly a single entry.
                    return moment(data.query).format(moment.monthFormat);
                }
            },
            route: getEntryRoute(/^\/([0-9]{4})\/(0[1-9]|1[0-2])\/?$/i)
        },{
            key: 'day',
            title: {
                dynamic: function(viewModel, data){ // always exactly a single entry.
                    return moment(data.query).format(moment.dayFormat);
                }
            },
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
}(window,nbrut,moment);