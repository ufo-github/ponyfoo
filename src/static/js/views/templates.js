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
}(window,nbrut);