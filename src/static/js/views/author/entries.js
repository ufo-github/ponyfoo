!function (window,Markdown,nbrut) {
    function prepare(render){
        $.ajax({
            url: '/api/1.0/entry',
            type: 'GET'
        }).done(function(res){
            var fixed = $.map(res.entries, function(i){
                i.date = new Date(i.date).toDateString();
                return i;
            });

            render({
                entries: fixed
            });
        });
    }

	function afterActivate(){
		var rows = $("tr.entry-row");
		
		rows.find('a.edit').on('click', function(){
			var id = $(this).closest(rows).data('id');

            nbrut.tt.activate('entry-editor', {
                key: 'edit',
                data: {
                    id: id
                }
            });
		});
		
		rows.find('a.remove').on('click', function(){
			$.ajax({
				url: '/api/1.0/entry',
				type: 'DELETE'
			}).done(function(res){
                var row = $(this).closest(rows);
				row.slideUp();
			});
		});
	}
	
    nbrut.tt.configure({
        key: 'entry-review',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,Markdown,nbrut);