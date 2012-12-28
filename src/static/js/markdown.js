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

    nbrut.tt.add({
        key: 'markdown-input',
        trigger: '#post-entry',
        source: '#markdown-template',
        onAfterActivate: runEditors
    });
}(window,Markdown,nbrut);