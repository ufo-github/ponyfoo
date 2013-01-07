!function (window,nbrut) {
	function prepare(render){
		$.ajax({
			url: '/api/1.0/entry',
			type: 'GET'
		}).done(function(res){
            var fixed = $.map(res.entries, function(i){
                i.brief = nbrut.md.sanitize(i.brief);
                i.text = nbrut.md.sanitize(i.text);
                return i;
            });

            render({
                entries: fixed
            });
		});
	}
	
    nbrut.tt.configure({
        key: 'home',
        prepare: prepare
    });
}(window,nbrut);