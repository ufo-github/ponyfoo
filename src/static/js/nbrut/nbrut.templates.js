!function (nbrut, window, $, undefined) {
    var templating = function () {
        var templates = {},
            stringKeys = {},
            regexKeys = [],
            active = [],
			activity = {
				history: []
			},
			defaultTemplate = 'home',
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
            var template = {};

            $.extend(template, defaults, settings);

            if(template.key in templates){
                throw new Error('template key not unique.');
            }
            read(template);

            templates[template.key] = template;

			setup(template);
        }
		
		function setup(template){
            $.each(template.aliases || [], function(){
                var alias = this;

				setupAlias(template, alias)
				bindTrigger(template, alias);
            });
		}
		
		function setupAlias(template, alias){
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
		}
		function bindTrigger(template, alias){
			if(typeof alias.trigger === 'string'){
				trigger = $(alias.trigger);
				trigger.on('click', function(e){
					if (e.which === 1){ // left-click
						activate(template.key);
						return false;
					}
				});
			}
		}

		function back(){
			var h = activity.history,
				to = h[h.length-1];
				
			if(!to){
				activate(defaultTemplate);
			}else{
				activate(to.key, to.settings);
			}
		}
		
		function bindBack(template){
			if(typeof template.back === 'string'){
				var backTrigger = $(template.back);
				backTrigger.on('click', back);
			}
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

            if (settings === undefined){
                settings = {};
            }

            if(template.container in active) {
                if(active[template.container] === template) { // already active template
                    if (activity.current !== undefined){ // template engine initialized
                        if(activity.current.settings.key === settings.key){ // same alias
                            if(!template.selfCleanup){
                                return;
                            }
                            soft = true; // don't push history state.
                        }
                    }
                }
                deactivateContainer(template.container); // clean-up.
            }
			
            if(!template.initialized){
                template.initialized = true;
                template.initialize();
            }			

			var render = function(viewModel){
				activateTemplate(template, settings, viewModel, soft); // set-up.
                fixLocalRoutes(template.container);
                bindBack(template);
				template.afterActivate(settings.data || {});
			};
			
			template.prepare(render, settings.data || {});
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
                    var title = setTitle(alias.title, viewModel),
                        url = alias.route.get(settings.data);

                    if(!soft){
                        history.pushState({
                            key: template.key,
                            settings: settings
                        }, title, url);
                    }
                }
				
				if (activity.current !== undefined){
					activity.history.push(activity.current);
				}
				activity.current = {
					key: template.key,
					settings: settings
				};
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

        function setTitle(settings, viewModel){
            var text = settings.value || settings.dynamic(viewModel),
                title = settings.literal ? text : titleSettings.format.format(text);

            titleSettings.tag.text(title);
            return title;
        }

        function getRoute(url){
            if(url === undefined){
                return {};
            }

            var result = {
                key: stringKeys[url]
            };

            if(result.key !== undefined){
                return result;
            }

            $.each(regexKeys, function() {
                var self = this,
                    captures = url.match(self.regex);
                if (captures !== null){
                    result = {
                        key: self.key,
                        settings: {
                            key: self.alias.key,
                            data: self.alias.route.map(captures)
                        }
                    };
                    return false;
                }
            });
            return result;
        }

        function fixLocalRoutes(container){
            $(container).find('a').each(function(){
               var self = $(this),
                   url = self.attr('href'),
                   route = getRoute(url);

                if(route.key !== undefined){
                    self.on('click', function(e){
                        if (e.which === 1){ // left-click
                            activate(route.key, route.settings);
                            return false;
                        }
                    });
                }
            });
        }

		function popState(e){
			var route;

			if (e.originalEvent === undefined || e.originalEvent.state === null){
                route = getRoute(document.location.pathname);
			} else {
                route = {
                    key: e.originalEvent.state.key,
				    settings: e.originalEvent.state.settings
                };
			}
			activate(route.key, route.settings, true);
		}
		
        function init(){
            $(function(){
                $(window).on('popstate', popState);

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
            deactivate: deactivateContainer,
            a: activity
        };
    }();

    nbrut.tt = templating;
}(nbrut, window, jQuery);