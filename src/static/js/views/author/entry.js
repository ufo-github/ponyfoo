!function (window,$,nbrut) {
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
		
		var previewContainer = $('#entry-preview');
		nbrut.md.prettify(previewContainer);
    }

    function prepare(render, data){
        if(!data.id){
            render({
                date: new Date().toDateString()
            });
        }else{
            nbrut.thin.get('entry', {
                id: data.id,
                then: function(it){
                    render(it.entry);
                }
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
            nbrut.thin.put('entry', {
                id: submit.data('id'),
                data: {
                    title: title.val(),
                    brief: brief.val(),
                    text: text.val(),
                    date: getDateJson()
                },
                then: function(){
                    nbrut.tt.activate('entry-review');
                }
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
}(window,jQuery,nbrut);