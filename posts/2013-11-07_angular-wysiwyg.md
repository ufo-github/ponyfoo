# Angular WYSIWYG

Building on the blocks laid out [in my previous article](/2013/10/25/event-emitter-obey-and-report "Event Emitter: Obey and Report"), I open-sourced a [WYSIWYG](http://en.wikipedia.org/wiki/WYSIWYG "What you see is what you get - Wikipedia") editing library _which doesn't provide an UI_. You can [find the source code here](https://github.com/bevacqua/ponyedit "bevacqua/ponyedit on GitHub").

`ponyedit` allows us to interact with a `contentEditable` element by following the **Obey and Report** pattern. It emits events whenever its state changes, and it takes commands that alter this state. This enables us to completely decouple the user interface from the component's functionality. In this article, we'll dig a little deeper into the pattern, analyzing the decisions made in ponyedit, how it came together, its resulting API, and the [sample _bare bones_ UI implementation](https://github.com/bevacqua/ponyedit/blob/master/web/assets/js/example.js "Sample WYSIWYG using ponyedit").

