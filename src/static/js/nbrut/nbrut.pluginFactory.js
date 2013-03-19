!function (nbrut, $, undefined) {
    'use strict';

    function create(){
        var plugins = [];

        function normalize(opts){
            if(typeof opts === 'string'){
                opts = {
                    eventName: opts,
                    context: 'global'
                };
            }
            return opts;
        }

        function raise(context, opts){
            opts = normalize(opts);

            var args = $.makeArray(arguments).splice(2),
                events = plugins[opts.eventName] || {},
                hooks = events[opts.context] || [];

            if(opts.context !== 'global'){ // avoid duplication
                hooks = hooks.concat(events.global || []);
            }

            args.unshift(context);

            $.each(hooks, function(){
                var hook = this;
                hook.apply(hook, args);
            });
        }

        function hook(opts, plugin){
            opts = normalize(opts);

            var events = plugins[opts.eventName];
            if (events === undefined){
                events = plugins[opts.eventName] = {};
            }

            var context = events[opts.context];
            if (context === undefined){
                context = events[opts.context] = [];
            }
            context.push(plugin);
        }

        return {
            raise: raise,
            hook: hook
        };
    }

    nbrut.pluginFactory = {
        create: create
    };
}(nbrut, jQuery);