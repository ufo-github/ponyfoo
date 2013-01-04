!function (window,Markdown,nbrut) {
    function prepare(render){
        $.ajax({
            url: '/api/1.0/entry',
            type: 'GET'
        }).done(function(res){
            render(res);
        });
    }

    nbrut.tt.add({
        key: 'entry-review',
        alias: '/author/entry/list',
        trigger: '#review-entries',
        source: '#entry-review-template',
        mustache: true,
        title: { value: 'All Posts', formatted: true },
        prepare: prepare
    });
}(window,Markdown,nbrut);