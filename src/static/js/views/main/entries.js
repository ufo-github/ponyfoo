!function (window,$,nbrut) {
	function prepare(render, data){
        if (data.query === undefined){
            complete(render, data);
        }else{
            nbrut.thin.get('entry', {
                then: function(it){
                    complete(render, data, it.entries)
                }
            });
        }
	}

    function complete(render, data, latest){
        nbrut.thin.get('entry', {
            id: data.query,
            then: function(it){
                render({
                    entries: it.entries || [it.entry],
                    latest: latest || it.entries
                });
            }
        });
    }
	
	function afterActivate(){
		var container = $('.blog-entries'),
            flipper = $('.sidebar-flipper'),
            card = $('.blog-sidebar .flip-card'),
            highlight = 'highlight',
            highlightSidebar = 'sidebar-flip-highlight',
            highlighted = nbrut.local.get(highlightSidebar, true);

		nbrut.md.prettify(container);

        if(highlighted === true){ // only when the user doesn't know about it.
            flipper.addClass(highlight);
        }

        flipper.on('click.flip', function(){
            card.toggleClass('flipped');
            flipper.removeClass(highlight);
            nbrut.local.set(highlightSidebar, false);
        })
	}
	
    nbrut.tt.configure({
        key: 'home',
        prepare: prepare,
		afterActivate: afterActivate
    });
}(window,jQuery,nbrut);