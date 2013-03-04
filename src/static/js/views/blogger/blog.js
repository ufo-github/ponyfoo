!function (window,$,nbrut) {
    function afterActivate(viewModel, data, ctx){
        var elements = ctx.elements,
            thumbnail = elements.find('#blog-thumbnail'),
            submit = elements.find('#blog-configuration-submit');

        var partial = nbrut.tt.partial('file-upload', {
            legend: ' ',
            fileType: 'image',
            url: '/api/1.0/file',
            thin: {
                name: 'file',
                eventContext: 'PUT file'
            },
            done: function (e, data) {
                thumbnail.val(data.result.url);
            }
        });

        partial.insertAfter(thumbnail).find('.upload-form').prepend(thumbnail);

        submit.on('click', function(){
            window.location.href = '/'; // intentional refresh to update blog context
        });
    }

    nbrut.tt.configure({
        key: 'blog-configuration',
        afterActivate: afterActivate
    });
}(window,jQuery,nbrut);