!function (window, $, nbrut, undefined) {
    var shared = [];

    function thinner(container){
        var apiVersion = '/api/1.0/',
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
            var id = !!opts.id ? '/' + opts.id : '',
                parent = !!opts.parent ? opts.parent.what + '/' + opts.parent.id + '/' : '',
                action = !!opts.action ? opts.action + '/' : '';

            xhr = $.ajax({
                url: '{0}{1}{2}{3}{4}'.format(apiVersion, parent, what, id, action),
                type: how,
                data: opts.data
            }).done(function(data){
                raise(what,how,data);
                (opts.then || $.noop)(data);
            }).always(function(data){
                var i = local.indexOf(xhr);
                local.splice(i,1);
                (opts.always || $.noop)(data);
            });

            local.push(xhr);
            return xhr;
        }

        function raise(what,how,data){
            ((hooks[what]||{})[how.toLowerCase()] || $.noop)(data);
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
            abort: abort,
            get pending(){ return local; }
        };
    }

    var thin = thinner();
    thin.thinner = thinner;

    nbrut.thin = thin;
}(window, jQuery, nbrut);