# The Rise of Micro Libraries #

As of late, there seems to be a _steady trend_ towards minimalist [DOM](https://developer.mozilla.org/en/docs/DOM "Document Object Model - MDN") (and **BOM**) abstractions, these micro-libraries generally trade _functionality and flexibility_ for _performance boosts._ 

The two most _common benefits_ of using this kind of modules are:

- Dramatic **performance boosts**, sometimes by _a factor of ten_, or similar
- **Lightweight** footprints. Less functionality translates into _less bandwidth going to waste_

I'll examine a few of these _shiny new tools_, comparing them to their _popular alternatives_. You can browse for micro libraries [here](http://microjs.com/ "MicroJS.com")

## ThinDOM ##

The first example that pops to mind is [ThinDOM](https://github.com/jacobgreenleaf/ThinDOM "ThinDOM by imgur, on GitHub"), as it only came to light a little over [a week ago](http://imgur.com/blog/2013/05/21/tech-tuesday-jquery-dom-performance/ "jQuery DOM performance - imgur blog").

**ThinDOM** is a thin **DOM** wrapper out-classes [jQuery](https://github.com/jquery/jquery "jQuery on GitHub") when it comes to **DOM** manipulation. It provides only a few methods, which are conveniently named like their **jQuery** counterparts:

- `.append()` is a blisteringly fast alternative to `$.append`
- `.css()` doesn't do any validation, or value transformation, [like $.css does](https://github.com/jquery/jquery/blob/master/src/css.js#L111-L132 "$.css source on GitHub")
- `.html()` doesn't provide any safeety, no parsing, nothing. [$.html](https://github.com/jquery/jquery/blob/master/src/manipulation.js#L124-L161 "$.html source on GitHub") is a tad slower
- `.attr()` just sets attribute values. That's it. Here's [$.attr](https://github.com/jquery/jquery/blob/master/src/attributes.js#L288-L334 "$.attr source on GitHub")'s take
- `.get()` unwraps the element wrapped under **ThinDOM**

Their API is _kind of clunky_. This example from their repo isn't the prettiest.

    var captionDOM = new ThinDOM('div').attr('class', 'caption')
        .append(new ThinDOM('div').attr('class', 'votes')
                .append(new ThinDOM('a').attr({'class': 'up', 'href': '#'}))
                .append(new ThinDOM('a').attr({'class': 'down', 'href': '#'})))
        .append(new ThinDOM('div').attr('class', 'meta')
                .append(new ThinDOM('span').text(author + ' - '))
                .append(new ThinDOM('span').text(points + ' point' + plural)))
        .append(new ThinDOM('p').html(body)).get();

But if _it's performance_ you need, then it definitely wins out.

## Mustache ##

I don't think [Mustache](http://mustache.github.io/ "{{ mustache }} - logic-less templates") needs any introduction. Just in case, it is an **insanely powerful** _templating_ library that's currently sitting at a footprint of just **2kB**
