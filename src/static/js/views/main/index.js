!function (window,nbrut) {
	function prepare(next){
		$.ajax({
			url: '/api/1.0/entry',
			type: 'GET'
		}).done(function(res){
			console.log(res);
			next();
		});
	}
	
    nbrut.tt.add({
        key: 'home',
        alias: '/',
        trigger: '#home',
        source: '#blog-template',
        prepare: prepare
    });
}(window,nbrut);