!function (window,$,nbrut) {
    function entryHook(data){
        $.each(data.entries || [data.entry], function(){
            var self = this,
                html = nbrut.md.html;

            self.date = new Date(self.date); // unwrap
            self.dateText = self.date.toDateString();
            self.html = {
                brief: html(self.brief),
                text: html(self.text)
            };
        });
    }

    nbrut.thin.hook('entry', {
        ajaxGet: entryHook
    });
}(window,jQuery,nbrut);