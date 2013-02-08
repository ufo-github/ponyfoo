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
}(window,nbrut);