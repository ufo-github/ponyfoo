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
                var entry = res.entries[0]; // TODO get single entry at '/api/1.0/entry/budbudbud'
                render(entry);
            });
        }
    }

    function bindSubmit(){
        var submit = $('#submit-entry'),
            title = $('#entry-title'),
            brief = $('#wmd-input-brief'),
            text = $('#wmd-input-text'),
            date = $('#entry-date');

        function getDateJson(){
            var dateString = date.val(),
                d = new Date(dateString);

            return d.toJSON();
        }

        nbrut.ui.stateButton(submit, function(restore){
            $.ajax({
                url: '/api/1.0/entry',
                type: 'PUT',
                data: {
                    entry: {
                        _id: submit.data('id'),
                        title: title.val(),
                        brief: brief.val(),
                        text: text.val(),
                        date: getDateJson()
                    }
                }
            }).done(function(res){
                // TODO: if error restore(500);
                nbrut.tt.activate('entry-review');
            });
        });
    }

    function afterActivate(){
        prepareEditor();
        $('#entry-date').pikaday();
        bindSubmit();
    }

    nbrut.tt.configure({
        key: 'entry-editor',
        prepare: prepare,
        afterActivate: afterActivate
    });
}(window,Markdown,nbrut);