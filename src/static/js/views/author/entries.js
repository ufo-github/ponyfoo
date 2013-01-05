!function (window,Markdown,nbrut) {
    function prepare(render){
        $.ajax({
            url: '/api/1.0/entry',
            type: 'GET'
        }).done(function(res){
            render(res);
        });
    }

	function afterActivate(){
		var rows = $("tr.entry-row");
		
		rows.find('a.edit').on('click', function(){
			var id = $(this).parentsUntil('tbody').data('id');
			nbrut.tt.activate('entry-editor'); // TODO pass route params [id] somehow.
		});
		
		rows.find('a.remove').on('click', function(){
			$.ajax({
				url: '/api/1.0/entry',
				type: 'DELETE'
			}).done(function(res){
                var row = $(this).parentsUntil('tbody');
				row.slideUp();
			});
		});
	}
	
    nbrut.tt.add({
        key: 'entry-review',
        alias: '/author/entry/list',
        trigger: '#review-entries',
        source: '#entry-review-template',
        mustache: true,
        title: { value: 'All Posts', formatted: true },
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,Markdown,nbrut);