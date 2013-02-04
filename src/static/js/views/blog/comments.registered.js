!function (window,$,nbrut,undefined) {
    function afterActivate(viewModel, data, ctx){
        nbrut.md.runEditor('-discussion');

        var editor = ctx.elements.find('.comment-editor'),
            textarea = ctx.elements.find('.wmd-input'),
            container = $('.blog-discussions'),
            create = ctx.elements.find('.discussion-create');

        create.on('click', function(){
            if(editor.is(':visible')){
                var comment = textarea.val();

                nbrut.thin.put('entry', {
                    id: viewModel.entryId + '/comment',
                    data: {
                        comment: comment
                    },
                    then: function(data){
                        // TODO: render the comment or discussion
                    }
                })
            }else{
                container.find('.comment-editor').hide();
                editor.show();
            }
        });
    }

    function afterActivateReply(viewModel, data, ctx){
        var elements = ctx.elements,
            editor = elements.find('.comment-editor'),
            textarea = elements.find('.wmd-input'),
            postfix = textarea.data('postfix'),
            container = $('.blog-discussions'),
            reply = elements.find('.discussion-reply');

        nbrut.md.runEditor(postfix);

        reply.on('click', function(){
            if(editor.is(':visible')){
                var comment = textarea.val();

                nbrut.thin.put('discussion', {
                    id: viewModel.id + '/comment',
                    data: {
                        comment: comment
                    },
                    then: function(data){
                        // TODO: render the comment
                    }
                })
            }else{
                container.find('.comment-editor').hide();
                editor.show();
            }
        });
    }

    nbrut.tt.configure({
        key: 'discussion-actions',
        afterActivate: afterActivate
    });

    nbrut.tt.configure({
        key: 'discussion-reply',
        afterActivate: afterActivateReply
    });
}(window,jQuery,nbrut);