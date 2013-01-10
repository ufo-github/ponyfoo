!function (window,$,nbrut) {
    function prepare(render){
        nbrut.thin.get('entry', {
            then: function(it){
                render(it);
            }
        });
    }

	function afterActivate(){
        $("tr.entry-row").each(function(){
			var row = $(this),
				id = row.data('id');

			row.find('a.remove').on('click', function(){
                nbrut.thin.del('entry', {
                    id: id,
                    then: function(){
                        row.fadeOutAndRemove();
                    }
                });
			});
		});
	}
	
    nbrut.tt.configure({
        key: 'entry-review',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);