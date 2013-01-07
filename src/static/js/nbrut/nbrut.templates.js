!function (nbrut, window, $, undefined) {
    var templating = function () {
        var templates = {},
            stringKeys = {},
            regexKeys = [],
            active = [],
            defaults = {
                container: '#content',
                mustache: false,
                initialized: false,
                initialize: $.noop,
                prepare: function(next){
					next();
				},
                afterActivate: $.noop,
                selfCleanup: true
            },
            titleSettings = {
                tag: $('title'),
                format: '{0} - Pony Foo'
            };

        function register(settings) {
            var template = {},
                trigger;

            $.extend(template, defaults, settings);

            if(template.key in templates){
                throw new Error('template key not unique.');
            }
            read(template);

            templates[template.key] = template;

            $.each(template.aliases || [], function(){
                var alias = this;

                alias.route = fixRouteObject(alias.route);

                if(!alias.route.regex){
                    stringKeys[alias.route.get()] = template.key;
                }else{
                    regexKeys.push({
                        key: template.key,
                        alias: alias,
                        regex: alias.route.regex
                    });
                }

                if(typeof alias.trigger === 'string'){
                    trigger = $(alias.trigger);
                    trigger.on('click', function(e){
                        if (e.which === 1){ // left-click
                            activate(template.key);
                            return false;
                        }
                    });
                }
            });
        }

        function configure(settings) {
            if(!(settings.key in templates)){
                throw new Error('template not registered.');
            }
            var configured = {},
                template = templates[settings.key];

            $.extend(configured, template, settings);
            templates[settings.key] = configured;
        }

        function read(template) {
            var s = $(template.source);
            if (s.length !== 1){
                throw new Error('template source not unique.');
            }
            var css = s.data('class'),
				html = s.remove().html();

            template.dom = {
                html: html,
                css: css
            };

            if (template.mustache){
				var m = {
					regex: /<!--[ ]*({{[^}]+}})[ ]*-->/g,
					replace: '$1'
				};
				var sanitized = html.replace(m.regex, m.replace);
                template.dom.view = Mustache.compile(sanitized);
            }
        }

        function fixRouteObject(source){
            if(typeof source === 'string'){
                return {
                    get: function(){
                        return source;
                    },
                    map: function(){
                        return null;
                    }
                };
            }
            return source;
        }

        function activate(key, settings, soft) { // soft: don't push history state.
            var template = templates[key];
            if (template === undefined) {
                template = templates['404']; // fall back to 404.
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
			
            if(!template.initialized){
                template.initialized = true;
                template.initialize();
            }			

            if (settings === undefined){
                settings = {};
            }
			var render = function(viewModel){
				activateTemplate(template, settings, viewModel, soft); // set-up.

				template.afterActivate(settings.data);
			};
			
			template.prepare(render, settings.data);
        }

        function deactivateContainer(container) {
            if(container in active){
                $(container).removeClass().empty().off();
                active.splice(active.indexOf(container), 1);
            }
        }

        function activateTemplate(template, settings, viewModel, soft){
            var c = $(template.container);
            if (c.length !== 1){
                throw new Error('template container not unique.');
            }

            var view;

            if(template.mustache){
                view = template.dom.view(viewModel);
            } else {
                view = template.dom.html;
            }

            c.html(view);
            c.addClass(template.dom.css);
            active[template.container] = template;

            if (template.container === defaults.container){
                var alias = getTemplateAlias(template, settings);
                if (alias !== undefined){
                    var title = setTitle(alias.title),
                        url = alias.route.get(settings.data);

                    if(!soft){
                        history.pushState({
                            key: template.key,
                            settings: settings
                        }, title, url);
                    }
                }
            }
        }

        function getTemplateAlias(template, settings){
            var key,
                alias;

            if(settings !== undefined){
                key = settings.key;
            }

            $.each(template.aliases, function(){
                if(this.key === key){
                    alias = this;
                    return false;
                }
            });

            return alias;
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
                    var url,
                        key,
                        settings;

                    if (e.originalEvent === undefined || e.originalEvent.state === null){
                        url = document.location.pathname;
                        key = stringKeys[url];

                        if (key === undefined){
                            $.each(regexKeys, function() {
                                var self = this,
                                    captures = url.match(self.regex);
                                if (captures !== null){
                                    key = self.key;

                                    settings = {
                                        key: self.alias.key,
                                        data: self.alias.route.map(captures)
                                    };
                                    return false;
                                }
                            })
                        }
                    } else {
                        var state =  e.originalEvent.state;
                        key = state.key;
                        settings = state.settings;
                    }
                    activate(key, settings, true);
                });

                // manual trigger loads template by URL in FF/IE.
                if ($.browser.mozilla || $.browser.msie) {
                    $(window).trigger('popstate');
                }
            });
        }

        return {
            init: init,
            register: register,
            configure: configure,
            activate: activate,
            deactivate: deactivateContainer
        };
    }();

    nbrut.tt = templating;
}(nbrut, window, jQuery);