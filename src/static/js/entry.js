!function (window,Markdown,nbrut) {
    function getConverter() {
        return Markdown.getSanitizingConverter();
    }

    function getEditor(converter, postfix){
        return new Markdown.Editor(converter, postfix);
    }

    function runEditor(converter, postfix) {
        var editor = getEditor(converter, postfix),
            selector = '#wmd-preview' + postfix,
            preview = $(selector);

        editor.run();
        editor.hooks.chain('onPreviewRefresh', function () {
            preview.find('a').anchorSEO();
            preview.find('pre, code:not(pre code)').addClass('prettyprint');
            prettyPrint();
        });
    }

    function runEditors(){
        var converter = getConverter();

        runEditor(converter, '-brief');
        runEditor(converter, '-text');
    }

    function onAfterActivate(){
        runEditors();

        $('entry-writing textarea:not(.processed)').textareaResizer();

        var input = $('#entry-title'),
            title = $('entry-writing .blog-entry-title h1');

        input.on('keydown keypress paste', function(){
            setTimeout(function() {
                var value = input.val();
                title.text(value);
            }, 0);
        });

        input.focus();
    }

    nbrut.tt.add({
        key: 'entry-editor',
        alias: '/write-entry',
        trigger: '#write-entry',
        source: '#entry-template',
        title: { value: 'New Post', formatted: true },
        onAfterActivate: onAfterActivate
    });
}(window,Markdown,nbrut);