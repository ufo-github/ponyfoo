!function (window,nbrut) {
    'use strict';

    var register = nbrut.tt.register;

    register({
        key: '404',
        source: '#not-found-template',
        title: 'Not Found'
    });

    register({
        key: 'metadata',
        source: '#metadata-template',
        mustache: true
    });

    register({
        key: 'validation',
        source: '#validation-template',
        mustache: true
    });

    register({
        key: 'validation-dialog',
        source: '#validation-dialog-template',
        mustache: true
    });

    register({
        key: 'file-upload',
        source: '#file-upload-template',
        mustache: true
    });

    register({
        key: 'expand-section',
        source: '#expand-section-template',
        mustache: true
    });

    register({
        key: 'table-pager',
        source: '#table-pager-template',
        mustache: true
    });

    register({
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