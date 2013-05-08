# Taming Asynchronous JavaScript #

Last month, a series of _very_ interesting articles regarding **async coding style**, in Node, popped up. The discussion spanned a few more subjects than _just coding style_, it was analyzed in a more _theoretical level_, as well as a _deep technical level_, obviously on the _practical level_, and _even politics_ saw the limelight in this _fascinating_ argument.

I'll try my best to put together a coherent article on the subject that doesn't put you to sleep. But I wouldn't bet my horse on that.

I'd bet _yours_, though.

I do realize I got _one month too late_ to the party, but [like I mentioned](/the-architecture-of-productivity "The Architecture of Productivity"), I was too busy visiting coffee shops in Amsterdam. Without further ado...

### Case Study: [Callbacks](https://github.com/caolan/async "'async' callback library") vs. [Promises](https://github.com/kriskowal/q "'q' promise library") ###

Firstly, I would like to cite the series of resources that prompted this blog post.

- [You're Missing the Point of Promises](http://domenic.me/2012/10/14/youre-missing-the-point-of-promises "An introduction to promises"), an introduction to promises
- [Node's biggest missed opportunity](http://blog.jcoglan.com/2013/03/30/callbacks-are-imperative-promises-are-functional-nodes-biggest-missed-opportunity "James' post in favor of promises in Node"), the article that triggered the _blog-post hell_, by [James Coglan](https://github.com/jcoglan "James Coglan on GitHub")
- [Broken Promises](http://www.futurealoof.com/posts/broken-promises.html "Broken Promises, written by Mikeal Rogers"), narrating why promises were `.reject()`'d in Node, by [Mikeal Rogers](https://github.com/mikeal "Mikeal Rogers on GitHub")
- [Broken Promises](http://sealedabstract.com/code/broken-promises "Broken Promises, written by Drew Crawford, an iOS developer"), another reply, depicting the pitfalls of promises and evangelizing patterns
- [Callbacks, promises, and simplicity](http://blog.jcoglan.com/2013/04/01/callbacks-promises-and-simplicity ""), one more jab at it

These are possibly the lengthiest articles written on the subject, but they definitely are the most interesting ones. I recommend to take your time and read through them, you won't regret it.

cover#each

cover#exceptions,error handling


tags: async promises callback-hell js best-practices quotes
