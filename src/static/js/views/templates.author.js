!function (window,nbrut) {
    nbrut.tt.register({
        key: 'entry-editor',
        source: '#entry-editor-template',
        mustache: true,
		back: '#cancel-entry',
        aliases: [{
            title: 'Entry Writer',
            route: '/author/entry',
            trigger: '#write-entry'
        }, {
            key: 'edit',
            title: 'Entry Editor',
            route: {
                regex: /^\/author\/entry\/([0-9a-f]{24})$/i,
                get: function(data){
                    return '/author/entry/{0}'.format(data.id);
                },
                map: function(captures){
                    return { id: captures[1] };
                }
            }
        }]
    });

    nbrut.tt.register({
        key: 'entry-review',
        source: '#entry-review-template',
        mustache: true,
        aliases: [{
            title: 'Review',
            route: '/author/entry/review',
            trigger: '#review-entries'
        }]
    });
}(window,nbrut);