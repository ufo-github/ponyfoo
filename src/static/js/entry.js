!function (window,Markdown,nbrut) {
    function getConverter() {
        var converter = Markdown.getSanitizingConverter();

        converter.hooks.chain('postConversion', function (text) {
            return text.replace(/<pre>/gi, '<pre class="prettyprint">');
        });

        return converter;
    }

    function getEditor(converter, postfix) {
        var editor = new Markdown.Editor(converter, postfix);

        editor.hooks.chain('onPreviewRefresh', function () {
            prettyPrint();
        });

        return editor;
    }

    function runEditors(){
        var converter = getConverter();
        var brief = getEditor(converter, '-brief');
        var text = getEditor(converter, '-text');

        brief.run();
        text.run();
    }

    function onAfterActivate(){
        runEditors();

        var input = $('#entry-title'),
            title = $('.blog-entry-title', $('#entry-editor'));

        input.on('keydown keypress paste', function(){
            setTimeout(function() {
                var value = input.val();
                title.text(value);
            }, 0);
        });
    }

    nbrut.tt.add({
        key: 'entry-editor',
        trigger: '#write-entry',
        source: '#entry-template',
        onAfterActivate: onAfterActivate
    });
}(window,Markdown,nbrut);