!function (window, $, nbrut, undefined) {
    var shared = [];

    function thinner(container){
        var ver = '/api/1.0',
            hooks = {},
            local;

        if (shared[container] === undefined){
            shared[container] = [];
        }
        local = shared[container];

        function part(p){
            if(!!p){
                return '/{0}'.format(p);
            }
            return '';
        }

        function get(what, opts){
            var id = part(opts.id);

            fire('GET',what,id).done(function(data){
                (hooks[what].ajaxGet || $.noop)(data);
                (opts.then || $.noop)(data);
            });
        }

        function put(what, opts){
            var id = part(opts.id);

            fire('PUT',what,id).done(function(data){
                (opts.then || $.noop)(data);
            });
        }

        function del(what, opts){
            fire('DELETE',what,opts.id).done(function(data){
                (opts.then || $.noop)(data);
            });
        }

        function fire(how,what,id){
            xhr = $.ajax({
                url: '{0}/{1}{2}'.format(ver, what, id),
                type: how
            });
            local.push(xhr);

            return xhr.always(function(){
                var i = local.indexOf(xhr);
                local.splice(i,1);
            });
        }

        function hook(what, opts){
            hooks[what] = opts;
        }

        function abort(){
            $.each(local, function(){
                this.abort();
            });
        }

        return {
            get: get,
            put: put,
            del: del,
            hook: hook,
            abort: abort
        };
    }

    var thin = thinner();
    thin.thinner = thinner;

    nbrut.thin = thin;
}(window, jQuery, nbrut);