!function (window,nbrut) {
	function beforeActivate(next){
		$.ajax({
			url: '/entry/latest'
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
		beforeActivate: beforeActivate
    });
}(window,nbrut);