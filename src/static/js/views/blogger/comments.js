!function (window,$,nbrut) {
    function prepare(render){
        nbrut.thin.get('discussion', {
            context: 'prepare',
            done: function(it){
                render(it);
            }
        });
    }

	function afterActivate(viewModel, data, ctx){
	}

    nbrut.tt.configure({
        key: 'blogger-comments',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);