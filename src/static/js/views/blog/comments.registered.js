!function (window,$,nbrut,undefined) {
    function afterActivate(viewModel, data, ctx){
        nbrut.md.runEditor('-discussion');

        ctx.elements.on('click', '.discussion-create', function(){
            var comment = ctx.elements.find('.wmd-input').val();

            nbrut.thin.put('entry', {
                id: viewModel.entryId + '/comment',
                data: {
                    comment: comment
                },
                then: function(data){
                    // TODO: render the comment or discussion
                }
            })
        });
    }

    function afterActivateReply(viewModel, data, ctx){
        console.log(viewModel);
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