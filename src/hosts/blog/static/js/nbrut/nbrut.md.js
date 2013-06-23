!function (window, $, nbrut, ultramarked, undefined) {
    'use strict';

    var md = function(){
        function getEditor(postfix){
            return new window.Markdown.Editor(postfix);
        }

        function runEditor(postfix) {
            var editorSelector = '#wmd-input' + postfix,
                editor = getEditor(postfix),
                previewSelector = '#wmd-preview' + postfix,
                preview = $(previewSelector);

            $(editorSelector).textareaResizer();

            editor.run();
            editor.hooks.chain('onPreviewRefresh', function(){
                postConvert(preview);
            });
        }

        function postConvert(container){
            container.anchorSEO('a:not(header a)');
            container.find('ul, ol').addClass('item-list');
        }

        function html(md){
            return ultramarked(md || '');
        }

        return {
            runEditor: runEditor,
            html: html,
            postConvert: postConvert
        };
    }();

    nbrut.md = md;
}(window, jQuery, nbrut, ultramarked);