!function (window,nbrut) {
	function prepare(render){
		$.ajax({
			url: '/api/1.0/entry',
			type: 'GET'
		}).done(function(res){
            var fixed = $.map(res.entries, function(i){
                i.brief = nbrut.md.html(i.brief);
                i.text = nbrut.md.html(i.text);
                return i;
            });

            render({
                entries: fixed
            });
		});
	}
	
	function afterActivate(){
		var container = $('.blog-entries');
		nbrut.md.prettify(container);
	}
	
    nbrut.tt.configure({
        key: 'home',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,nbrut);