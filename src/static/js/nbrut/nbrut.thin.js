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

        function get(what, opts){
            fire('GET',what,opts);
        }

        function put(what, opts){
            fire('PUT',what,opts);
        }

        function del(what, opts){
            fire('DELETE',what,opts);
        }

        function fire(how,what,opts){
            var id = !!opts.id ? '/' + opts.id : '';

            xhr = $.ajax({
                url: '{0}/{1}{2}'.format(ver, what, id),
                type: how,
                data: opts.data
            });
            local.push(xhr);

            return xhr.always(function(){
                var i = local.indexOf(xhr);
                local.splice(i,1);
            }).done(function(data){
                (hooks[what][how.toLowerCase()] || $.noop)(data);
                (opts.then || $.noop)(data);
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