!function (window,$,nbrut) {
	function prepare(render, data){
        nbrut.thin.get('entry', {
            id: data.query,
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
}(window,jQuery,nbrut);