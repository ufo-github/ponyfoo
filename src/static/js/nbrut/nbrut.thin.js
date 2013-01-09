!function (window, $, nbrut, undefined) {
    var thin = function(){
        var ver = '/api/1.0';

        function get(opts){
            $.ajax({
                url: '{0}/{1}'.format(ver, opts.what),
                type: 'GET'
            }).done(function(res){
                // TODO: process any configured GET hooks (this would be one), based on opts.what too
                $.each(res.entries, function(){
                    var self = this,
                        html = nbrut.md.html;

                    self.date = new Date(self.date);
                    self.dateText = self.date.toDateString();
                    self.html = {
                        brief: html(self.brief),
                        text: html(self.text)
                    };
                });

                (opts.then || $.noop)(res);
            });
        }

        function put(opts){
            var id = '';
            if(!!opts.id){
                id = '/{0}'.format(opts.id);
            }

            $.ajax({
                url: '{0}/{1}{2}'.format(ver, opts.what, id),
                type: 'PUT',
                data: opts.data
            }).done(function(res){
                (opts.then || $.noop)(res);
            });
        }

        function del(opts){
            $.ajax({
                url: '{0}/ {1}/{2}'.format(ver, opts.what, opts.id),
                type: 'DELETE'
            }).done(function(res){
                // TODO: if res failed, dialog.
                (opts.then || $.noop)(res);
            });
        }

        return {
            get: get,
            put: put,
            del: del
        };
    }();

    nbrut.thin = thin;
}(window, jQuery, nbrut);