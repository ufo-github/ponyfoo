# The Emerging Browser Framework War #

What once was the browser _utility library_ war, has now been settled, [jQuery](http://jquery.com/ "jQuery library") won that war. We are now in the midst of another war, the _framework_ war, with [AngularJS](http://angularjs.org/ "Angular Model-View-Whatever Framework") leading the competition. There are lots to pick from though, and it isn't anywhere near settled. Popular frameworks include [BackboneJS](http://backbonejs.org/ "Backbone.js library"), [EmberJS](http://emberjs.com/ "Ember.js framework"), [SproutCore](http://sproutcore.com/ "SproutCore MVC"), [KnockoutJS](http://knockoutjs.com/ "Knockout.js Model-View-ViewModel Framework"), just to name a few.

Before **Node** and **Angular**, it wasn't all that common opening a web project and finding front-end code _organized in a way that scaled_. This war will probably drag on for at least a couple more years.

As we can see on [TodoMVC](http://todomvc.com/ "TodoMVC MV* Comparison"), there are _a boatload_ of different **MV*** frameworks out there. I expect that many of those won't make it very far, while a few will gain more traction.

It wasn't that long ago we had the whole [RequireJS (AMD) vs CommonJS (Node)](http://blog.millermedeiros.com/amd-is-better-for-the-web-than-commonjs-modules/ "AMD is better for the web than CommonJS modules, by Miller Medeiros") war, either. Luckily that's [more or less](http://tomdale.net/2012/01/amd-is-not-the-answer/ "AMD is Not the Answer, by Tom Dale") settled, but I did start a new project, called [LazyJS](http://bevacqua.github.io/lazyjs/ "LazyJS: The minimalist JS loader"), which I consider an _alternative approach_ to the existing script loading options.

---- client-side development organization frameworks ----

## [CommonJS Modules/1.1](http://wiki.commonjs.org/wiki/Modules/1.1 "CommonJS Modules Spec") ##

foo

## [RequireJS](http://requirejs.org/ "RequireJS script loader")

bar

### So, what do I think? ###

To me, it's a fact that **CommonJS** is not aimed at the browser, although I prefer it for Node. However, **RequireJS** attempts to do too much when it comes to the browser, and _kind of fails at it_.

You need a lot of boilerplate code in order to get **AMD** working, and _it shouldn't have to be that way_.

# How's **LazyJS** any different? #

[KISS](http://en.wikipedia.org/wiki/KISS_principle "Keep it simple stupid"), probably. 

> **RequireJS** allows modules on the `Object` level, but  I'm _not so hot_ on the idea that my script loader should _also_ take on the task of providing [inversion of control](http://en.wikipedia.org/wiki/Inversion_of_control "Inversion of Control technique") and dependency injection mechanisms

[LazyJS](http://bevacqua.github.io/lazyjs/ "LazyJS: The minimalist JS loader") is different in that **it can become whatever you want it to be**. It's different in that it lets you organize blocks of code (entire files or chunks), and specify their dependencies.

For now it doesn't even have an API, it's just _an idea_. And I want to spend some time figuring out the best "out of the box" feature-set, without staining everyone's code with extra code.

Suppose you want it to "become" **CJS**, then you should reference a bundle, disable AJAX calls, and let it resolve everything on its own before, synchronously, giving you a result back.

Similarly, you can leave it pretty much on its [current state](https://github.com/bevacqua/lazyjs/tree/9d3c3173ec067a83f5e4afafc29b9e195ef05798 "LazyJS on GitHub, as of 2013-05-10"), expose the `.lookup(url, done)` [function](https://github.com/bevacqua/lazyjs/blob/9d3c3173ec067a83f5e4afafc29b9e195ef05798/src/lazy-loader.js#L112), and voilá, you've got RequireJS. Sort of.

Feedback regarding [LazyJS](http://bevacqua.github.io/lazyjs/ "LazyJS: The minimalist JS loader") is welcome, and I promise to try my best to leave it _as agnostic and unopinionated as possible_.
