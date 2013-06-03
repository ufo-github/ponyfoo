!function (window, $, nbrut, undefined) {
    'use strict';

    var shared = [];

    function thinner(container){
        var apiVersion = '/api/1.0/',
            plugins = nbrut.pluginFactory.create(),
            local;

        if (shared[container] === undefined){
            shared[container] = [];
        }
        local = shared[container];

        function get(what, opts){
            fire('GET',what,opts);
        }

        function post(what, opts){
            fire('POST',what,opts);
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
                action = !!opts.action ? opts.action + '/' : '',
                apiPrefix = opts.api !== false ? apiVersion : '',
                xhr;

            opts.eventContext = '{0} {1}'.format(how, what);

            var ajaxOptions = {
                url: '{0}{1}{2}{3}{4}'.format(apiPrefix, parent, what, id, action),
                type: how,
                data: opts.data,
                dataType: 'json',
                context: opts.context
            };

            if(how !== 'GET'){ // send valid JSON instead of url-encoded form data
                ajaxOptions.contentType = 'application/json; charset=utf-8';
                ajaxOptions.data = JSON.stringify(ajaxOptions.data || {});
            }

            xhr = $.ajax(ajaxOptions);

            track(xhr, opts);
            return xhr;
        }

        function abort(){
            $.each(local, function(){
                this.abort();
            });
            local = [];
        }

        function track(xhr, opts){
            function untrack(){
                var i = local.indexOf(xhr);
                local.splice(i,1);
            }

            function raiseHooks(name){
                return function(dataOrXhr, textStatus, errorThrownOrXhr){
                    var raiseOpts = {
                        eventName: name,
                        context: opts.eventContext
                    };

                    plugins.raise(opts.context, raiseOpts, dataOrXhr, textStatus, errorThrownOrXhr);
                    (opts[name] || $.noop)(dataOrXhr, textStatus, errorThrownOrXhr);
                };
            }

            xhr.done(raiseHooks('done'))
                .fail(raiseHooks('fail'))
                .always(raiseHooks('always'))
                .always(untrack);

            local.push(xhr);
        }

        return {
            get: get,
            post: post,
            put: put,
            del: del,
            hook: plugins.hook,
            abort: abort,
            pending: function(){ return local; },
            track: track
        };
    }

    var thin = thinner();
    thin.thinner = thinner;

    nbrut.thin = thin;
}(window, jQuery, nbrut);