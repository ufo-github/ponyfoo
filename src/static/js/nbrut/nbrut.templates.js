!function (nbrut, window, $, undefined) {
    var templating = function () {
        var templates = {},
            keys = {},
            active = [],
            defaults = {
                container: '#content',
                initialized: false,
                initialize: $.noop,
                onAfterActivate: $.noop,
                title: {
                    value: 'Code Rant',
                    formatted: false
                },
                selfCleanup: true
            },
            titleSettings = {
                tag: $('title'),
                format: '{0} - Code Rant'
            };

        function add(template) {
            var settings = {},
                trigger;

            $.extend(settings, defaults, template);

            if(settings.key in templates){
                throw new Error('template key not unique.');
            }
            read(settings);

            templates[settings.key] = settings;
            keys[settings.alias] = settings.key;

            trigger = $(settings.trigger);
            trigger.on('click', function(e){
                if (e.which === 1){ // left-click
                    activate(settings.key);
                    return false;
                }
            });
        }

        function read(template) {
            var s = $(template.source);
            if (s.length !== 1){
                throw new Error('template source not unique.');
            }
            var css = s.data('class');
            var html = s.remove().html();

            template.dom = {
                html: html,
                css: css
            };
        }

        function activate(key, soft) { // soft: don't push history state.
            var template = templates[key];
            if (template === undefined) {
                template = templates['404']; // fall back to 404.
            }

            if(!template.initialized){
                template.initialized = true;
                template.initialize();
            }

            if(template.container in active) {
                if(active[template.container] === template) { // already active.
                    if(!template.selfCleanup){
                        return;
                    }
                    soft = true; // don't push history state.
                } else {
                    deactivateContainer(template.container); // clean-up.
                }
            }

            activateTemplate(template, soft); // set-up.

            template.onAfterActivate();
        }

        function deactivateContainer(container) {
            if(container in active){
                $(container).removeClass().empty().off();
                active.splice(active.indexOf(container), 1);
            }
        }

        function activateTemplate(template, soft){
            var c = $(template.container);
            if (c.length !== 1){
                throw new Error('template container not unique.');
            }
            c.html(template.dom.html);
            c.addClass(template.dom.css);
            active[template.container] = template;

            if (template.container === defaults.container){
                var title = setTitle(template.title);

                if(!soft){
                    history.pushState(template.key, title, template.alias);
                }
            }
        }

        function setTitle(title){
            var use;

            if(title.formatted){
                use = titleSettings.format.format(title.value);
            } else {
                use = title.value;
            }
            titleSettings.tag.text(use);
            return use;
        }

        function init(){
            $(function(){
                $(window).on('popstate', function(e){
                    ready = true;

                    if (e.originalEvent === undefined || e.originalEvent.state === null){
                        key = keys[document.location.pathname];
                    } else {
                        key = e.originalEvent.state;
                    }
                    activate(key, true);
                });

                if ($.browser.mozilla) { // manual trigger fixes an inconsistency in Firefox.
                    $(window).trigger('popstate');
                }
            });
        }

        return {
            init: init,
            add: add,
            activate: activate,
            deactivate: deactivateContainer
        };
    }();

    nbrut.tt = templating;
}(nbrut, window, jQuery);