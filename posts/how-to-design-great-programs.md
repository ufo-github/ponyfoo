# How to Design Great Programs

This article is a recollection of application design best practices I've accrued over the years. I felt like documenting these practices in a blog post, for future reference. I'll talk not so much about implementation, but more about **program design theory**.

Below are the central arguments I'll touch on in the article.

1. **Do one thing**, and _do it well_
2. Provide excellent API interfaces
3. Centralize configuration
4. Avoid single points of failure
5. Document all the things (readme-first!)

# 1. Do one thing

Great programs are designed with a single goal. Whether we're talking about a CLI, desktop, mobile, web application, or even an API, doesn't matter, the principle remains the same. A program that's focused on doing a single thing has far better chances of doing it well, being reusable, and being better at it. There are quite a few good examples, such as [through][2], or [ansi-styles][3] in the Node community of packages which do exactly one thing well.

Programs don't have to be a just a few lines long in order to comply. Both [npm][4] and [connect][5] are great examples of programs which do just one thing well. The goal for `npm` is to provide a package manager which just works. It does double as a development productivity tool, but that's just a side-effect of being a well rounded package manager. On the other hand, `connect`provides a middleware layer for Node's native [`http`][6], along with a few readily available ones. As another example, [campaign][7] provides a pluggable email sending layer with a [convention over configuration][8] approach, which reduces configuration bloat for a basic email sending service.

>At any scale, do one thing and do it well.


# 2. Excellent API interfaces

Let us define API interfaces as a **consumer-facing interface for a component**, regardless of _transport_. An API might be any of:

- The methods exported by a JavaScript package
- Those exposed by a module in that package
- The CLI interface to a command-line program
- REST API endpoints provided by a web application

I find that these translate quite nicely to human interaction design as well, and I find that I treat both with the same kind of respect more and more, even if I strive to meet different goals in each case.

Design interfaces as if consumers didn't know how to code
- Only provide methods that will be used
- group arguments together
- method naming


Consider, as an example, [Gulp, Grunt, Whatever][1], from last week, where we analyzed the trade-offs between the simplicity in Gulp, compared with the _overload-pandemonium_ in Grunt. While Grunt provides lots of functionality, it also provides many different ways to accomplish the same goal. This is not necessarily a good thing. Due to Grunt's configuration juggernaut model, consumers aren't able to properly separate task targets, even if they belong to entirely different workflows.

[1]: /2014/01/09/gulp-grunt-whatever "Gulp, Grunt, Whatever"
[2]: https://github.com/dominictarr/through "dominictarr/through on GitHub"
[3]: https://github.com/sindresorhus/ansi-styles "sindresorhus/ansi-styles on GitHub"
[4]: https://github.com/npm/npm "npm/npm on GitHub"
[5]: https://github.com/senchalabs/connect "senchalabs/connect on GitHub"
[6]: http://nodejs.org/api/http.html "HTTP module documentation for Node"
[7]: https://github.com/bevacqua/campaign "bevacqua/campaign on GitHub"
[8]: http://en.wikipedia.org/wiki/Convention_over_configuration "Convention over Configuration on Wikipedia"

{best-practices api]
