!function (window,nbrut) {
    nbrut.tt.register({
        key: 'discussion-actions',
        source: '#discussion-actions-template'
    });

    nbrut.tt.register({
        key: 'discussion-reply',
        source: '#discussion-reply-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'discussion-thread',
        source: '#discussion-thread-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'discussion-comment',
        source: '#discussion-comment-template',
        mustache: true
    });

    nbrut.tt.register({
        key: 'comment-edit',
        source: '#comment-edit-template'
    });

    nbrut.tt.register({
        key: 'user-profile-edit',
        source: '#user-profile-edit-template',
        mustache: true,
        aliases: [{
            title: 'Edit Profile',
            route:{
                regex: /\/user\/profile\/([a-f0-9]{24})\/edit$/,
                get: function(data){
                    return '/user/profile/{0}/edit'.format(data.id);
                },
                map: function(captures){
                    return { id: captures[1] };
                }
            }
        }]
    })
}(window,nbrut);