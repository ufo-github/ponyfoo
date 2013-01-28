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
                format: '{0} - ' + nbrut.site.title
            },
            loading = '',
            plugins = [];

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

				setupAlias(template, alias);
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

        function getHash(){
            return activity.history.length + (activity.current === undefined ? 0 : 1);
        }

        function equalSettings(x){
            var c = activity.current.settings,
                sameKey = c.key === x.key; // same route alias
            if(!sameKey){
                return false;
            }
            if(c.data === null && x.data === null){ // both null
                return true;
            }
            if(c.data === null || x.data === null){ // one null
                return false;
            }
            return equalRouteData(c.data, x.data);
        }

        function equalRouteData(c, x){
            for(var key in c){
                if(c[key] !== x[key]){
                    return false;
                }
            }
            return true;
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
                        if(equalSettings(settings)){ // compare template settings
                            if(!template.selfCleanup){
                                return;
                            }
                            soft = true; // don't push history state.
                        }
                    }
                }
                deactivateContainer(template); // clean-up.
            }
			
            if(!template.initialized){
                template.initialized = true;
                template.initialize();
            }

            settings.identifier = getHash();

			function render(viewModel, err){
                if(settings.identifier !== getHash()){ // prevent mis-rendering when the user navigated away.
                    return;
                }
                if(err === true){
                    activate();
                    return;
                }
				activateTemplate(template, settings, viewModel || {}, soft); // set-up.
			}

			template.prepare(render, settings.data || {}, settings.identifier);
        }

        function deactivateContainer(template) {
            if(template.container in active){
                raise('deactivate', template);
                $(template.container).removeClass().off().html(loading);
                active.splice(active.indexOf(template.container), 1);
            }
        }

        function activateTemplate(template, settings, viewModel, soft){
            var c = $(template.container);
            if (c.length !== 1){
                throw new Error('template container not unique.');
            }

            active[template.container] = template;

            if (template.container === defaults.container){
                var alias = getTemplateAlias(template, settings);
                if (alias !== undefined){
                    var title = setTitle(alias.title, viewModel, settings.data),
                        url = alias.route.get(settings.data);

                    if(!soft){
                        history.pushState({
                            key: template.key,
                            settings: settings
                        }, title, url);
                    }
                }else if(template.title){
                    setTitle(template.title, viewModel, settings.data);
                }
				
				if (activity.current !== undefined){
					activity.history.push(activity.current);
				}
				activity.current = {
					key: template.key,
					settings: settings
				};
            }

            var view = partial(template.key, viewModel);
            view.fill(c, settings.data || {}, settings.identifier);
        }

        function partial(key, viewModel, data){
            var template = templates[key];
            if (template === undefined){
                template = templates['404']; // fall back to 404.
            }

            var html;

            if(template.mustache){
                html = template.dom.view(viewModel);
            } else {
                html = template.dom.html;
            }

            return {
                html: html,
                css: template.dom.css,
                fill: function(container, data, identifier){
                    container.addClass(template.dom.css).html(html);
                    fixLocalRoutes(container);
                    bindBack(template);
                    template.afterActivate(viewModel, data || {}, identifier);
                },
                appendTo: function(container, data){ /* NOTE: the data-class will be lost, same for event bindings. */
                    var temp = $('<div/>');
                    this.fill(temp, data);
                    var elements = temp.children();
                    elements.appendTo(container);
                    return elements;
                }
            };
        }

        function getTemplateAlias(template, settings){
            var key,
                alias;

            if(settings !== undefined){
                key = settings.key;
            }

            $.each(template.aliases || [], function(){
                if(this.key === key){
                    alias = this;
                    return false;
                }
            });

            return alias;
        }

        function setTitle(opts, viewModel, data){
            if(typeof opts === 'string'){
                opts = {
                    text: opts
                };
            }else if($.isFunction(opts)){
                opts = {
                    dynamic: opts
                }
            }

            var text = opts.text || opts.dynamic(viewModel, data),
                title = opts.literal === true ? text : titleSettings.format.format(text);

            titleSettings.tag.text(title);
            viewModel.title = text;
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
            container.find('a').each(function(){
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

        function activateRoute(route){
            activate(route.key, route.settings, true);
        }

		function popState(e){
            var initial = e.originalEvent === undefined || e.originalEvent.state === null;
			if(!initial){
                activateRoute({
                    key: e.originalEvent.state.key,
				    settings: e.originalEvent.state.settings
                });
			}
		}
		
        function init(){
            loading = $(defaults.container).html();

            $(window).on('popstate', popState);

            $(function(){
                var route = getRoute(document.location.pathname);
                activateRoute(route);
            });
        }

        function raise(eventName){
            var args = $.makeArray(arguments).splice(1);
            $.each(plugins[eventName] || [],function(){
                this.apply(null, args);
            });
        }

        function hook(eventName, plugin){
            if (plugins[eventName] === undefined){
                plugins[eventName] = [];
            }
            plugins[eventName].push(plugin);
        }

        return {
            defaults: defaults,
            init: init,
            register: register,
            configure: configure,
            activate: activate,
            deactivate: deactivateContainer,
            partial: partial,
            hook: hook,
            get active() { return getHash() - 1; } /* offset by one because 0 means nothing is active yet */
        };
    }();

    nbrut.tt = templating;
}(nbrut, window, jQuery);