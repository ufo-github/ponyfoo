!function (window, $, nbrut, undefined) {
    var thin = function(){
        var ver = '/api/1.0',
            hooks = {};

        function part(p){
            if(!!p){
                return '/{0}'.format(p);
            }
            return '';
        }

        function get(what, opts){
            var id = part(opts.id);

            $.ajax({
                url: '{0}/{1}{2}'.format(ver, what, id),
                type: 'GET'
            }).done(function(res){
                (hooks[what].ajaxGet || $.noop)(res);
                (opts.then || $.noop)(res);
            });
        }

        function put(what, opts){
            var id = part(opts.id);

            $.ajax({
                url: '{0}/{1}{2}'.format(ver, what, id),
                type: 'PUT',
                data: opts.data
            }).done(function(res){
                (opts.then || $.noop)(res);
            });
        }

        function del(what, opts){
            $.ajax({
                url: '{0}/{1}/{2}'.format(ver, what, opts.id),
                type: 'DELETE'
            }).done(function(res){
                // TODO: if res failed, dialog.
                (opts.then || $.noop)(res);
            });
        }

        function hook(what, opts){
            hooks[what] = opts;
        }

        return {
            get: get,
            put: put,
            del: del,
            hook: hook
        };
    }();

    nbrut.thin = thin;
}(window, jQuery, nbrut);