!function (window,Markdown,nbrut) {
    function prepare(render){
        $.ajax({
            url: '/api/1.0/entry',
            type: 'GET'
        }).done(function(res){
            res.entries = $.map(res.entries, function(i){
                i.date = new Date(i.date).toDateString();
                return i;
            });

            render(res);
        });
    }

	function afterActivate(){
		var rows = $("tr.entry-row");
		
		rows.each(function(){
			var row = $(this),
				id = row.data('id');
			
			row.find('a.edit').on('click', function(){
				nbrut.tt.activate('entry-editor', {
					key: 'edit',
					data: {
						id: id
					}
				});
			});
			
			row.find('a.remove').on('click', function(){
				$.ajax({
					url: '/api/1.0/entry/{0}'.format(id),
					type: 'DELETE'
				}).done(function(res){
					row.fadeOutAndRemove();
				});
			});
		});
	}
	
    nbrut.tt.configure({
        key: 'entry-review',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,Markdown,nbrut);