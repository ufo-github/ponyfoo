!function (window,nbrut) {
    nbrut.tt.register({
        key: '404',
        source: '#not-found-template',
        title: 'Not Found'
    });

    nbrut.tt.register({
        key: 'opengraph',
        source: '#opengraph-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'validation-errors',
        source: '#validation-errors-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'validation-dialog',
        source: '#validation-dialog-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'file-upload',
        source: '#file-upload-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'expand-section',
        source: '#expand-section-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'table-pager',
        source: '#table-pager-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'user-profile',
        source: '#user-profile-template',
        mustache: true,
        aliases: [{
            title: function(viewModel){
                return viewModel.displayName;
            },
            route:{
                regex: /\/user\/profile\/([a-f0-9]{24})$/,
                get: function(data){
                    return '/user/profile/{0}'.format(data.id);
                },
                map: function(captures){
                    return { id: captures[1] };
                }
            }
        }]
    });
}(window,nbrut);