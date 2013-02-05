!function (window,$,nbrut,undefined) {
    function unified(elements,buttonClass,opts){
        var editor = elements.find('.comment-editor'),
            textarea = elements.find('.wmd-input'),
            postfix = textarea.data('postfix'),
            button = elements.find(buttonClass),
            container = $('.blog-discussions');

        nbrut.md.runEditor(postfix);

        button.on('click.comment', function(){
            if(editor.is(':hidden')){
                container.find('.comment-editor').hide();
                editor.show();
                return;
            }

            textarea.prop('disabled', true);
            nbrut.ui.disable(button);
            nbrut.thin.put(opts.what, {
                id: opts.id,
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
    }

    function afterDiscussion(elements,data){
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

    function afterComment(elements,data){
        var partial = nbrut.tt.partial('discussion-comment', data.comment),
            comment = partial.insertBefore(elements);

        nbrut.md.prettify(comment);
    }

    function afterActivate(viewModel, data, ctx){
        unified(ctx.elements,'.discussion-create',{
            what: 'entry',
            id: viewModel.entryId + '/comment',
            done: afterDiscussion
        });
    }

    function afterActivateReply(viewModel, data, ctx){
        unified(ctx.elements,'.discussion-reply',{
            what: 'discussion',
            id: viewModel.id + '/comment',
            done: afterComment
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