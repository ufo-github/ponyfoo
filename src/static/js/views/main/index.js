!function (window,nbrut) {
	function prepare(render){
        nbrut.thin.get('entry', {
            then: function(it){
                render(it);
            }
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