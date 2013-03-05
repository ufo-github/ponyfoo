!function (window,$,nbrut) {
    function afterActivate(viewModel, data, ctx){
        var elements = ctx.elements,
            thumbnail = elements.find('#blog-thumbnail'),
            submit = elements.find('#blog-configuration-submit'),
            partial = nbrut.tt.partial('file-upload', nbrut.ui.uploadExtend({
                legend: ' ',
                done: function (e, data) {
                    thumbnail.val(data.result.url).focus();
                }
            }));

        partial.insertAfter(thumbnail).find('.upload-form').prepend(thumbnail);

        submit.on('click', function(){
            nbrut.thin.put('blog', {
                data: {
                    // TODO: pass data to PUT blog
                },
                context: elements.find('.main-configuration'),
                done: function(){
                    window.location.href = '/'; // intentional refresh to update blog context
                }
            });
        });
    }

    nbrut.tt.configure({
        key: 'blog-configuration',
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);