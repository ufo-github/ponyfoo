!function (window,nbrut) {
    nbrut.tt.register({
        key: '404',
        source: '#not-found-template',
        title: 'Not Found'
    });

    nbrut.tt.register({
        key: 'validation-errors',
        source: '#validation-errors-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'discussion-list',
        source: '#discussion-list-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'user-profile',
        source: '#user-profile-template',
        mustache: true,
        aliases: [{
            title: 'User Profile',
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