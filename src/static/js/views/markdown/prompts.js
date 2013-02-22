!function (window,$,nbrut,undefined) {
    function afterActivate(viewModel, data, ctx){
        var dialog = ctx.elements,
            input = dialog.find('.prompt-input');

        dialog.find('.ok-button').on('click', ok);
        input.on('keydown', function(e){
            if(e.which === 13){
                ok();
                return false;
            }
        });

        function ok(){
            dialog.trigger('container.close');
            var text = input.val();
            viewModel.complete(text);
        }
    }

    function afterActivateImage(viewModel, data, ctx){
        afterActivate(viewModel, data, ctx);

        var dialog = ctx.elements,
            area = dialog.find('.upload-area'),
            fileUpload = area.find('.upload-input'),
            dragClass = 'upload-dragover',
            fileTypes = /(\.|\/)(gif|jpe?g|png)$/i;

        area.on('dragover', function(){
            area.addClass(dragClass);
        }).on('dragleave drop', function(){
            area.removeClass(dragClass);
        });

        fileUpload.fileupload({
            type: 'PUT',
            url: '/api/1.0/file',
            dataType: 'json',
            dropZone: area,
            pasteZone: area,
            add: function(e, data){
                if(data.paramName !== 'file'){
                    return;
                }

                data.files = $.filter(data.files, function(){
                    var file = this;
                    return !fileTypes.test(file.type) && !fileTypes.test(file.name);
                }).slice(0,1); // just the first image file.

                var xhr = data.submit();
                nbrut.thin.track(xhr);
            },
            done: function (e, data) {
                console.log(data);
            }
        });
    }

    nbrut.tt.configure({
        key: 'prompt-link',
        afterActivate: afterActivate
    });

    nbrut.tt.configure({
        key: 'prompt-image',
        afterActivate: afterActivateImage
    });
}(window,jQuery,nbrut);