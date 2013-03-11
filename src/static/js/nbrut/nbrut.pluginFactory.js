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

        function raise(opts){
            var context = this;

            opts = normalize(opts);

            var args = $.makeArray(arguments).splice(1),
                events = plugins[opts.eventName] || {},
                hooks = events[opts.context] || [];

            if(opts.context !== 'global'){ // avoid duplication
                hooks = hooks.concat(events.global || []);
            }

            $.each(hooks, function(){
                this.apply(context, args);
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
        }
    }

    nbrut.pluginFactory = {
        create: create
    };
}(nbrut, jQuery);