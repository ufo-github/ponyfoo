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

        var body = $('body'),
            doc = $(document),
            dialog = ctx.elements,
            area = dialog.find('.upload-area'),
            dropText = dialog.find('.upload-drop-text'),
            uploadContainer = dialog.find('.upload-form'),
            fileUpload = area.find('.upload-input'),
            dragClass = 'upload-dragover',
            fileTypes = /(\.|image\/)(gif|jpe?g|png)$/i;

        body.on('dragover.invalidate-dragover', function(){
            if(!area.hasClass(dragClass)){
                area.addClass(dragClass);
                dropText.centerTextOnParent();
            }
        }).on('mouseenter.invalidate-dragover drop.invalidate-dragover', function(){
            if (area.hasClass(dragClass)){
                area.removeClass(dragClass);
                dropText.clearInlineMargins();
            }
        });

        fileUpload.fileupload({
            type: 'PUT',
            url: '/api/1.0/file',
            dataType: 'json',
            dropZone: area,
            pasteZone: area,
            add: function(e, data){
                var xhr;

                if(data.paramName !== 'file'){
                    return;
                }

                data.files = $.map(data.files, function(file){
                    if (fileTypes.test(file.type) || fileTypes.test(file.name)){
                        return file;
                    }
                }).slice(0,1); // just the first image file.

                uploadContainer.find('.validation-errors').remove();

                if(data.files.length === 0){
                    var validation = nbrut.tt.partial('validation-errors', {
                        errors: ['Only GIF, JPEG and PNG images are allowed.']
                    });
                    validation.prependTo(uploadContainer);
                }else{
                    xhr = data.submit();
                    nbrut.thin.track(xhr, {
                        name: 'file',
                        eventContext: 'PUT file',
                        context: uploadContainer
                    });
                }
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