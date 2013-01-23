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
		var container = $('.blog-entries'),
            flipper = $('.sidebar-flipper'),
            highlight = 'highlight',
            highlightSidebar = 'sidebar-flip-highlight',
            enabled = nbrut.local.get(highlightSidebar, true);

		nbrut.md.prettify(container);

        if(enabled === true){ // only when the user doesn't know about it.
            flipper.addClass(highlight);
        }

        flipper.on('click.flip', function(){
            flipper.removeClass(highlight);
            nbrut.local.set(highlightSidebar, false);
            $('.blog-sidebar .flip-card').toggleClass('flipped');
        })
	}
	
    nbrut.tt.configure({
        key: 'home',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);