!function (window, $, nbrut, undefined) {
    var md = function(){
        function getConverter() {
            return Markdown.getSanitizingConverter();
        }

        function getEditor(converter, postfix){
            return new Markdown.Editor(converter, postfix);
        }

        function reformatMarkdown(container){
            container.anchorSEO('a:not(header a)');
            container.find('pre, code:not(pre code)').addClass('prettyprint');
            container.find('ul, ol:not(.linenums)').addClass('item-list');
            prettyPrint();
        }

        function runEditor(postfix) {
            var converter = getConverter(),
                editorSelector = '#wmd-input' + postfix,
                editor = getEditor(converter, postfix),
                previewSelector = '#wmd-preview' + postfix,
                preview = $(previewSelector);

            $(editorSelector).textareaResizer();

            editor.run();
            editor.hooks.chain('onPreviewRefresh', function(){
                reformatMarkdown(preview);
            });
        }

        function html(md){
            var converter = getConverter();
            var html = converter.makeHtml(md || '');
            return html;
        }

        return {
            runEditor: runEditor,
            html: html,
            prettify: reformatMarkdown
        };
    }();

    nbrut.md = md;
}(window, jQuery, nbrut);