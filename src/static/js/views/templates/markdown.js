!function (window,nbrut) {
    var register = nbrut.tt.register;

    register({
        key: 'prompt-link',
        source: '#prompt-link-template',
        mustache: true
    });

    register({
        key: 'prompt-image',
        source: '#prompt-image-template',
        mustache: true
    });
}(window,nbrut);