!function (window,Markdown,nbrut) {
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

    function runEditor(converter, postfix) {
        var editor = getEditor(converter, postfix),
            selector = '#wmd-preview' + postfix,
            preview = $(selector);

        editor.run();
        editor.hooks.chain('onPreviewRefresh', function(){
            reformatMarkdown(preview);
        });
    }

    function runEditors(){
        var converter = getConverter();

        runEditor(converter, '-brief');
        runEditor(converter, '-text');
    }

    function updateTitleClass(title, value){
        if(value.length === 0){
            title.addClass('empty');
        }else{
            title.removeClass('empty');
        }
    }

    function prepareEditor() {
        runEditors();

        $('.entry-writing textarea:not(.processed)').textareaResizer();

        var input = $('#entry-title'),
            title = $('.entry-writing .blog-entry-title h1');

        input.on('keydown keypress paste', function(){
            setTimeout(function() {
                var value = input.val();
                title.text(value);
                updateTitleClass(title, value);
            }, 0);
        });
        input.focus();
        updateTitleClass(title, '');
    }

    function onAfterActivate(){
        prepareEditor();

        var submit = $('#submit-entry'),
            title = $('#entry-title'),
            brief = $('#wmd-input-brief'),
            text = $('#wmd-input-text');

        nbrut.ui.stateButton(submit, function(restore){
            $.ajax({
                data: {
                    entry: {
                        title: title.val(),
                        brief: brief.val(),
                        text: text.val()
                    }
                }
            }).done(function(res){
                restore(1000);
            });
        });
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