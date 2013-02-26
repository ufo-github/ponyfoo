!function (window,$,nbrut) {
    function prepare(render){
        nbrut.thin.get('user', {
            context: 'prepare',
            done: function(it){
                render(it);
            }
        });
    }

	function afterActivate(viewModel, data, ctx){
	}

    nbrut.tt.configure({
        key: 'blogger-users',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);