# Growing Past jQuery #

We've looked at doing some of the things that you can do in native code. So far, we've covered AJAX, event handling, event delegation, DOM querying, and DOM manipulation. If you haven't _already_ read that, you _[probably should](/2013/06/10/uncovering-the-native-dom-api "Uncovering the Native DOM API").

Why do we _really_ use jQuery? Sure, it simplifies things. But do we really need _all those abstractions_? Can't we get away with just a few of _the most basic abstractions_?

![jquery.jpg][1]

If we look at their [API documentation](http://api.jquery.com/ "jQuery API Documentation"), we can _quickly categorize_ the features we use most frequently.

- AJAX
- Attributes, CSS, `.data`
- Effects, Animations
- Events
- DOM Querying, Selectors
- DOM Manipulation
- **Plugins**

That certainly _looks like_ a lot. Lets break it down, and attempt to arrive at the same functionality, but _without jQuery_. Our aim in doing so, isn't just getting rid of jQuery for the sake of doing so, but thinking about why we'd want it _in the first place_. Furthermore, we will be gaining insight into how jQuery operates, what is needed, what is not, and maybe even more importantly, understanding and becoming capable of performing these operations on our own.

## Scope

I previously mentioned the [micro library movement](http://microjs.com "Fantastic Micro Frameworks and Libraries"), which is awesome, too. Here, though, we will _pick a few battles_ of our own, and have a shot at resolving them without resorting to external dependencies. Other than _what browsers provide_, that is.

Keep in mind, also, browser versions. In each of my solutions, I'll tell you what the browser support is for that particular approach. I will mostly speak about _future-proof solutions_, but most of what I talk about will _probably not work in IE 6_. So keep an eye on that.

Even if you are working in a project that must support older browsers, for whatever reason, I think you'll still find value in these excerpts. Maybe they aren't that useful to you _today_, maybe they are. One thing is certain though, _these APIs won't be going away anytime soon_.

## AJAX

At this point, I think I should introduce you to [XHR2](http://www.html5rocks.com/en/tutorials/file/xhr2/ "New Tricks in XMLHttpRequest2"). Lets start by talking about [browser support](http://caniuse.com/xhr2 "Can I Use XHR2?"). As you can see, XHR2 support includes anything that's not `IE < 10 || Android < 3.0`. That's _not very encouraging_, but it's workable.

- more



##### Need a Talk? #####

Below is an excellent talk on jQuery, by Remy Sharp. He addresses a lot of important points, and raises some very good questions. He also presents a minimal library called [min.js](github.com/remy/min.js "min.js on GitHub"), which I think shows _a lot_ of promise. In this half hour _ish_ talk, you'll learn how you can actually write native BOM pretty effortlessly, without having to resort to a jQuery-like library.

[![remy-on-jquery](http://i.imgur.com/nORxT86.jpg "remy.jpg")](http://vimeo.com/68910118 "So you know jQuery. Now what?")

##### In Conclusion #####

> I don't expect you to _shelf_ jQuery right away. I'm just attempting to enlighten you, _there is another way to do things_. jQuery is great and all, but it's been around for _almost ten years_, so it's _understandable_ that it lost some value along the way.

And it's not _jQuery's fault_, but rather, we should be _complimenting the browsers_ for this change. Going forward, IE11 is finally [putting an end](http://www.nczonline.net/blog/2013/07/02/internet-explorer-11-dont-call-me-ie/ "Internet Explorer 11: Don't call me IE") to all the non-sense set forth by it's predecessors, and they're really trying this time.

Now that all major browsers offer automatic updates, jQuery will _steadily decline in value_. The very purpose of the library, dealing with the **multitude of cross browser issues** present in older browsers are _subsiding_.

  [1]: http://i.imgur.com/8wWcU19.jpg "jQuery"