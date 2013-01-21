!function (window,$,nbrut) {
	function prepare(render, data){
        nbrut.thin.get('entry', {
            id: data.query,
            then: function(it){
                render(it.entry);
            }
        });
	}
	
	function afterActivate(data, viewModel){
		var container = $('.blog-entry');
		nbrut.md.prettify(container);
        nbrut.disqus.load(container, {
            identifier: viewModel.url,
            url: viewModel.absoluteUrl,
            title: viewModel.title
        });
	}
	
    nbrut.tt.configure({
        key: 'entry',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);