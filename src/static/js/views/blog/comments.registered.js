!function (window,$,nbrut,undefined) {
    function unified(elements,buttonClass,opts){
        var editor = elements.find('.comment-editor'),
            textarea = elements.find('.wmd-input'),
            postfix = textarea.data('postfix'),
            button = elements.find(buttonClass),
            container = $('.blog-discussions'),
            remove = elements.find('.remove');

        nbrut.md.runEditor(postfix);

        button.on('click.comment', function(){
            if(editor.is(':hidden')){
                container.find('.comment-editor').hide();
                editor.show();
                return;
            }

            textarea.prop('disabled', true);

            nbrut.ui.disable(button);
            nbrut.thin.put('comment', {
                parent: opts.parent,
                data: { comment: textarea.val() },
                then: function(data){
                    textarea.val('');
                    textarea.prop('disabled', false);

                    elements.find('.blog-comment').empty(); // clear preview
                    nbrut.ui.enable(button);

                    opts.done(elements,data);
                }
            });
        });
        /*
         remove.on('click.remove', function(){
         nbrut.thin.del('comment',{

         });
         });*/
    }

    function afterPuttingDiscussion(elements,data){
        var model = {
                _id: data.discussion,
                comments: [data.comment]
            },
            partial = nbrut.tt.partial('discussion-thread', model),
            thread = partial.insertBefore(elements);

        var reply = nbrut.tt.partial('discussion-reply', { id: data.discussion });
        reply.appendTo(thread);

        nbrut.md.prettify(thread);
    }

    function afterPuttingComment(elements,data){
        var partial = nbrut.tt.partial('discussion-comment', data.comment),
            comment = partial.insertBefore(elements);

        nbrut.md.prettify(comment);
    }

    function afterActivateDiscussion(viewModel, data, ctx){
        unified(ctx.elements,'.discussion-create',{
            parent: {
                what: 'entry',
                id: viewModel.entryId
            },
            done: afterPuttingDiscussion
        });
    }

    function afterActivateReply(viewModel, data, ctx){
        unified(ctx.elements,'.discussion-reply',{
            parent: {
                what: 'discussion',
                id: viewModel.id
            },
            done: afterPuttingComment
        });
    }

    function afterActivateComment(viewModel, data, ctx){
        var elements = ctx.elements,
            comment = viewModel, discussion;

        if (comment.comments !== undefined){ // new discussions
            comment = comment.comments[0]; // normalize
        }

        discussion = comment.root ? elements : elements.parents('.blog-discussion');

        // TODO: replicate for discussion-list template
        elements.find('.remove').on('click.remove', function(){
            nbrut.thin.del('comment',{
                id: comment._id,
                parent: {
                    what: 'discussion',
                    id: discussion.data('id')
                },
                then: function(){
                    if(comment.root === true){
                        elements.slideUp();
                    }
                }
            });
        });
    }

    nbrut.tt.configure({
        key: 'discussion-actions',
        afterActivate: afterActivateDiscussion
    });

    nbrut.tt.configure({
        key: 'discussion-reply',
        afterActivate: afterActivateReply
    });

    nbrut.tt.configure({
        key: 'discussion-comment',
        afterActivate: afterActivateComment
    });

    nbrut.tt.configure({
        key: 'discussion-thread',
        afterActivate: afterActivateComment
    });
}(window,jQuery,nbrut);