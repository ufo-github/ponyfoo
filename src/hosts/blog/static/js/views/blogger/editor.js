!function (window,$,nbrut) {
    'use strict';

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
                context: 'prepare',
                done: function(it){
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
        var editor = $('#entry-editor'),
            submit = $('#submit-entry'),
            title = $('#entry-title'),
            brief = $('#wmd-input-brief'),
            text = $('#wmd-input-text'),
            tags = $('#entry-tags'),
            id = submit.data('id');

        submit.on('click', function(){
            nbrut.ui.disable(submit);
            nbrut.thin.put('entry', {
                id: id,
                data: {
                    entry: {
                        title: title.val(),
                        brief: brief.val(),
                        text: text.val(),
                        tags: tags.val().trimReduce().split(' ')
                    }
                },
                context: editor,
                done: function(res){
                    nbrut.tt.activate('entry-review', {
                        data: {
                            highlightId: id || res.id
                        }
                    });
                },
                always: function(){
                    nbrut.ui.enable(submit);
                }
            });
        });
    }

    function afterActivate(){
        bindTitle();
        bindSubmit();
    }

    nbrut.tt.configure({
        key: 'entry-editor',
        prepare: prepare,
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);