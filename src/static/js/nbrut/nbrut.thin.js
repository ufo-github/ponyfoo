!function (window, $, nbrut, undefined) {
    var shared = [];

    function thinner(container){
        var apiVersion = '/api/1.0/',
            plugins = nbrut.pluginFactory.instance(),
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
            }).done(done).always(always);

            function done(data){
                plugins.raise({
                    eventName: 'done',
                    context: how + ' ' + what
                }, data);

                (opts.then || $.noop)(data);
            }

            function always(data){
                var i = local.indexOf(xhr);
                local.splice(i,1);

                plugins.raise({
                    eventName: 'always',
                    context: how + ' ' + what
                }, data);

                (opts.always || $.noop)(data);
            }

            local.push(xhr);
            return xhr;
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
            hook: plugins.hook,
            abort: abort,
            get pending(){ return local; }
        };
    }

    var thin = thinner();
    thin.thinner = thinner;

    nbrut.thin = thin;
}(window, jQuery, nbrut);