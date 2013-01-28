!function (window,$,nbrut) {
    function runEditors(){
        nbrut.md.runEditor('-brief');
        nbrut.md.runEditor('-text');
    }

    function bindTitle(){
        var input = $('#entry-title'),
            title = $('.entry-editor .blog-entry-title h1');

        function updateTitlePreview() {
            var value = input.val();
            title.text(value);
            title.toggleClass('empty', value.length === 0);
        }

        input.on('keydown keypress paste', function(){
            setTimeout(updateTitlePreview, 0);
        });
        input.focus();
        updateTitlePreview();
    }

    function prepareEditor() {
        runEditors();

        $('.entry-editor textarea:not(.grippable)').textareaResizer();

        bindTitle();
		
		var previewContainer = $('#entry-preview');
		nbrut.md.prettify(previewContainer);
    }

    function prepare(render, data){
        if(!data.id){
            render({
                entry: {},
                submit: {
                    text: 'Post',
                    disabled: 'Posting...'
                }
            });
        }else{
            nbrut.thin.get('entry', {
                id: data.id,
                then: function(it){
                    render({
                        entry: it.entry,
                        submit: {
                            text: 'Update',
                            disabled: 'Updating...'
                        }
                    });
                }
            });
        }
    }

    function bindSubmit(){
        var submit = $('#submit-entry'),
            title = $('#entry-title'),
            brief = $('#wmd-input-brief'),
            text = $('#wmd-input-text');

        nbrut.ui.stateButton(submit, function(restore){
            nbrut.thin.put('entry', {
                id: submit.data('id'),
                data: {
                    entry: {
                        title: title.val(),
                        brief: brief.val(),
                        text: text.val()
                    }
                },
                then: function(){
                    nbrut.tt.activate('entry-review');
                }
            });
        });
    }

    function afterActivate(){
        prepareEditor();
        bindSubmit();
    }

    nbrut.tt.configure({
        key: 'entry-editor',
        prepare: prepare,
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);