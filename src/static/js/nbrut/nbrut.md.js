!function (window, $, nbrut, undefined) {
    var md = function(){
        function getConverter() {
            return Markdown.getSanitizingConverter();
        }

        function getEditor(converter, postfix){
            return new Markdown.Editor(converter, postfix);
        }

        function reformatMarkdown(container){
            container.find('a').anchorSEO();
            container.find('pre, code:not(pre code)').addClass('prettyprint');
            prettyPrint();
        }

        function runEditor(postfix) {
            var converter = getConverter(),
                editor = getEditor(converter, postfix),
                selector = '#wmd-preview' + postfix,
                preview = $(selector);

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