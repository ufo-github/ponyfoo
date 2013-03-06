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
                    blog: {
                        title: elements.find('#blog-title').val(),
                        legend: elements.find('#blog-legend').val(),
                        meta: elements.find('#blog-meta').val(),
                        thumbnail: elements.find('#blog-thumbnail').val(),
                        description: elements.find('#wmd-input-description').val(),
                        social: {
                            rss: elements.find('#social-rss').prop('checked'),
                            email: elements.find('#social-email').val(),
                            github: elements.find('#social-github').val(),
                            stackoverflow: elements.find('#social-stackoverflow').val(),
                            careers: elements.find('#social-careers').val(),
                            linkedin: elements.find('#social-linkedin').val(),
                            twitter: elements.find('#social-twitter').val()
                        }
                    }
                },
                context: elements.filter('.main-configuration'),
                done: function(){
                    // YO DAWG! I heard you like loaders, so I put a loader before you load your landing page.
                    nbrut.tt.loading();
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