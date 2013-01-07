!function (window,Markdown,nbrut) {
    function runEditors(){
        nbrut.md.runEditor('-brief');
        nbrut.md.runEditor('-text');
    }

    function bindTitle(){
        var input = $('#entry-title'),
            title = $('.entry-writing .blog-entry-title h1');

        function updateTitlePreview() {
            var value = input.val();
            title.text(value);

            if(value.length === 0){
                title.addClass('empty');
            }else{
                title.removeClass('empty');
            }
        }

        input.on('keydown keypress paste', function(){
            setTimeout(updateTitlePreview, 0);
        });
        input.focus();
        updateTitlePreview();
    }

    function prepareEditor() {
        runEditors();

        $('.entry-writing textarea:not(.processed)').textareaResizer();

        bindTitle();
    }

    function prepare(render, data){
        if(!data){
            render({});
        }else{
            $.ajax({
                url: '/api/1.0/entry',
                type: 'GET'
            }).done(function(res){
                var entry = res.entries[0];
                render(entry);
            });
        }
    }

    function afterActivate(){
        prepareEditor();

        var submit = $('#submit-entry'),
            title = $('#entry-title'),
            brief = $('#wmd-input-brief'),
            text = $('#wmd-input-text');

        nbrut.ui.stateButton(submit, function(restore){
            $.ajax({
				url: '/api/1.0/entry',
                type: 'PUT',				
                data: {
                    entry: {
                        _id: submit.data('id'),
                        title: title.val(),
                        brief: brief.val(),
                        text: text.val()
                    }
                }
            }).done(function(res){
                restore(500);
            });
        });
    }

    nbrut.tt.configure({
        key: 'entry-editor',
        prepare: prepare,
        afterActivate: afterActivate
    });
}(window,Markdown,nbrut);