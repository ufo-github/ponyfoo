!function (nbrut, $, undefined) {
    var templating = function () {
        var templates = {};
        var active = [];

        var defaults = {
            container: '#content',
            initializeTemplate: $.noop,
            onAfterActivate: $.noop
        };

        function add(template) {
            templates[template.key] = {
                key: template.key,
                trigger: template.trigger,
                dom: read(template),
                container: template.container || defaults.container,
                initialized: false,
                initialize: template.initialize || defaults.initializeTemplate,
                onAfterActivate: template.onAfterActivate || defaults.onAfterActivate
            };

            $(template.trigger).on('click', function(){
                activate(template.key);
            });
        }

        function read(template) {
            var s = $(template.source);
            if (s.length !== 1){
                throw new Error('template source not unique.');
            }
            var css = s.data('class');
            var html = s.remove().html();

            return {
                html: html,
                css: css
            };
        }

        function activate(key) {
            var template = templates[key];
            if (template === undefined) {
                throw new Error('template not registered.');
            }

            if(!template.initialized){
                template.initialized = true;
                template.initialize();
            }

            if(template.container in active) {
                if(active[template.container] === template) {
                    return; // already active.
                } else {
                    deactivateContainer(template.container); // clean-up.
                }
            }

            activateTemplate(template); // set-up.

            template.onAfterActivate();
        }

        function deactivateContainer(container) {
            if(container in active){
                $(container).empty();
                active.splice(active.indexOf(container), 1);
            }
        }

        function activateTemplate(template){
            var c = $(template.container);
            if (c.length !== 1){
                throw new Error('template container not unique.');
            }
            c.html(template.dom.html);
            c.attr('class',template.dom.css);
            active[template.container] = template;
        }

        return {
            add: add,
            activate: activate,
            deactivate: deactivateContainer
        };
    }();

    nbrut.tt = templating;
}(nbrut, jQuery);