# The Angular Way

For the past few months I've been sailing around the world of Angular. Today I can hardly imagine myself doing day to day coding on a large front-end web application without some kind of data binding framework, such as [Angular.js](http://angularjs.org/ "Angular.js MVW Framework"), [Backbone.js](http://backbonejs.org/ "Backbone.js"), and [friends](http://underscorejs.org/ "Underscore.js utility belt").

I might however be _a bit biased_, considering the application I'm working on is a **PhotoShop**esque editor in the browser, which presents the same data in _radically different_ ways.

- Layers are presented graphically, taking up large portions of the screen. They are also listed in a panel where you can delete them.
- When you select a layer it gets the typical dashed line around its edges, and it also gets highlighted in the list view.
- Similarly, properties like the dimensions of a layer show up both in a panel and define their size upon the canvas.
- The panels I've mentioned can be dragged around, collapsed, and closed.

This kind of interaction, data binding, and view synchronization would be easily be a **maintenance nightmare** if it wasn't for a framework such as Angular. Being able to update a model in one place, and have Angular update all relevant views almost feels like cheating. Adding, removing, or moving a layer is just a matter of changing an object. `layer.x += 10`, done. There's no need to invalidate the view by hand, or to manually update each instance of the layer in the DOM. Or to even interact with the DOM, for that matter. 

Angular enabled us to go places we wouldn't ever have dreamt of, such as setting up a bunch of keyboard shortcuts that are enabled based on the current context of the application. For example, text editing shortcuts such as <kbd>cmd</kbd> <kbd>b</kbd> to toggle **bold** text are just enabled when we're editing a text layer.

[![app-press-shortcuts.png][2]](http://i.imgur.com/I1ZDYeO.png "Click to enlarge")

Similarly, we tacked a description onto these shortcuts (which are registered through a _service_ we created), and we are then able to show a list of shortcuts, along with their descriptions, in a handy cheat sheet. Furthermore, we wrote a _directive_ which enables us to bind individual DOM elements with their keyboard shortcut counterparts, showing a tooltip when you hover over them for a little while, letting you know a keyboard shortcut is available, too.

> Angular enabled us to go places we wouldn't ever have dreamt of.

Honestly, it's as if we weren't writing a web application anymore. The web is just the medium. As we improve our understanding of Angular, the code gets more modular, more self-contained, and yet... more inter-connected. It is simply becoming **more Angular**.

And by Angular I mean the highly interactive rich application development phylosophy behind Angular.js, the same that has enabled us to develop a piece of software that I wouldn't have thought possible a while back.

[![app-press-canvas.png][1]](http://i.imgur.com/RSqiAkS.png "Click to enlarge")

We were even able to develop a full-fledged history panel that updates the DOM to the currently selected point in history, and _it performs well, too_! Seeing the data binding capabilities of Angular update every small detail in your view work flawlessly as you go back and forth in the history panel is inspiring, to say the least.

#### It wasn't always so easy

Indeed, in the last few weeks we've been updating and re-writing the overall architecture of our front-end. Before we took up this re-write, looking to update Angular to [edge](https://github.com/angular/angular.js/tree/v1.2.0rc1 "Angular.js v1.2.0 RC 1"), all the way from [0.10.6](https://github.com/angular/angular.js/tree/v0.10.6 "Angular.js v0.10.6"). That's a pretty long way to go, if you look at the [change log](https://github.com/angular/angular.js/blob/v1.2.0rc1/CHANGELOG.md#0106-bubblewrap-cape-2012-01-17 "Angular.js change log, starting at v0.10.6").

Going through this refactoring, we went from doing Angular _the wrong way_, to _the Angular way_.

The wrong way, at least in our case, comprehended:

- 


  [1]: http://i.imgur.com/RSqiAkS.png
  [2]: http://i.imgur.com/I1ZDYeO.png