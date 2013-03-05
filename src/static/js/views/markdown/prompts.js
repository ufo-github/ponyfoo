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
        arrangeImageUpload(ctx);
    }

    function arrangeImageUpload(ctx){
        var dialog = ctx.elements,
            dialogBody = dialog.find('.dialog-body'),
            upload = nbrut.tt.partial('file-upload', nbrut.ui.uploadExtend({
                done: function (e, data) {
                    var input = dialog.find('.prompt-input'),
                        ok = dialog.find('.ok-button'),
                        response = data.result,
                        link = '{0} "{1}"'.format(response.url, response.alt);

                    input.val(link);
                    ok.trigger('click');
                }
            }));

        upload.appendTo(dialogBody);
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