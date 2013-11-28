# Get Between the Covers of Build First

A couple of weeks ago, my book on [JavaScript Application Design](http://bevacqua.io/buildfirst "JavaScript Application Design: A Build First Approach") and front-end processes _(which I began writing a few months ago)_ finally went into the first review stage. Yesterday, [an early access edition](http://bevacqua.io/bf/book "MEAP: Manning Early Access Program") was made available by [Manning](http://manning.com/ "Manning Publications Co."), this version contains the first 3 chapters, and gives you access to the entire book, which you'll be able to download chapter by chapter, as they get released. Feedback [has been pretty good so far](https://news.ycombinator.com/item?id=6808229 "Feedback on Hacker News").

Here, have _an amusing quote_:

<blockquote class="twitter-tweet" lang="en"><p><a href="https://twitter.com/nzgb">@nzgb</a> <a href="https://twitter.com/fogus">@fogus</a> Books complimenting each other: “Hey, nice assets, I’d like to get between your covers…&quot;</p>&mdash; Reg Braithwaite (@raganwald) <a href="https://twitter.com/raganwald/statuses/405783532162670592">November 27, 2013</a></blockquote>

In this article I'll be describing some of the concepts which I explain in the book, while attempting not to sound _as dull_ as these kind of posts usually are _(and probably failing quite miserably at that)_.

[![buildfirst.jpg][1]](http://bevacqua.io/buildfirst "JavaScript Application Design: A Build First Approach")

> **TL;DR**
>
> The Build First philosophy will help you approach application building in a more disciplined way. Adopting a build-oriented mentality, designing large but maintainable JavaScript applications, and deploying from the command line are some of the key take-aways in the book.

As you might've read, this is a book about designing JavaScript applications in a build-oriented manner. To get a hint about the contents of Part I, on build processes, I've compiled a list with a few articles on the subject you can peek at. Part I is dedicated entirely to the build and deployment processes. You'll learn how to automate integration testing, deployments, builds, and even development. Grunt _(as a tool)_ is taught from scratch, but the concepts should stick with you even if you part ways with Grunt.

- [Deploying Node Apps to AWS Using Grunt](/2013/09/19/deploying-node-apps-to-aws-using-grunt "Deploying Node Apps to AWS Using Grunt on Pony Foo")
- [Continuous Development in Node.js](/2013/09/26/continuous-development-in-nodejs "Continuous Development in Node.js on Pony Foo")
- [Grunt Tips and Tricks](/2013/11/13/grunt-tips-and-tricks "Grunt Tips and Tricks on Pony Foo")
- [Understanding Build Processes](/2013/05/22/understanding-build-processes "Understanding Build Processes on Pony Foo")
- [Managing Code Quality in Node.js](/2013/03/22/managing-code-quality-in-nodejs)
- [Upgraded Asset Management](/2013/07/22/upgraded-asset-management "Upgraded Asset Management on Pony Foo")

Part II is dedicated to complexity management in JavaScript applications. Here, chapters cover topics such as modularity and package management, asynchronous programming styles, unit and integration testing _(again, in JavaScript)_. Solid JavaScript programming in general. I've also written a few relevant articles on the subject as well.

- [The Angular Way](/2013/08/27/the-angular-way "The Angular Way on Pony Foo")
- [Uncovering the Native DOM API](/2013/06/10/uncovering-the-native-dom-api "Uncovering the Native DOM API on Pony Foo")
- [Getting Over jQuery](/2013/07/09/getting-over-jquery "Getting Over jQuery on Pony Foo")
- [Fun with Native Arrays](/2013/11/19/fun-with-native-arrays "Fun with Native Arrays on Pony Foo")
- [The Web Wars](/2013/05/13/the-web-wars "The Web Wars on Pony Foo")
- [Taming Asynchronous JavaScript](/2013/05/08/taming-asynchronous-javascript "Taming Asynchronous JavaScript on Pony Foo")
- [Pragmatic Unit Testing in JavaScript](/2013/03/28/pragmatic-unit-testing-in-javascript "Pragmatic Unit Testing in JavaScript on Pony Foo")
- [Information Hiding in JavaScript](/2013/02/21/information-hiding-in-javascript "Information Hiding in JavaScript on Pony Foo")



# Trivia you probably don't care about

This is **actually the first thing** I wrote about, because it's _what drove me to write the book_. I then moved it to the bottom, because you would've probably skipped it anyways. If you're enthusiastic about this book, you might find these facts to be a tad more interesting.

When I originally pitched the book to [Manning](http://manning.com/ "Manning Publications Co."), I **had a book about Node.js in mind**. Over the months, the focus changed to code quality, development workflow, and build process optimizations. Here is an excerpt taken right from _the proposal I sent to Manning_, listing of topics I was **entertaining back in May**.

> I'd like to write about how to set up an effective development environment, and how to architect a coherent application in JavaScript, both for the front-end and the back-end.
>
> ### Topics the book might cover would include:
>
> - Node fundamentals, common patterns, I might want to spend 2-3 chapters in introducing some of the lesser known aspects of JS development
> - Web Application Architecture, I would separate this in two, back-end and front-end, talk about architecture in Node, architecture in the back end, how to keep them loosely coupled, and how to let them communicate. I wouldn't stay high level but give actual practical advice or examples, such as efficiently using Express and AngularJS
> - Environments, how to set up an environment that favors productivity, mastering everyday tools, such as text editors, consoles, and git
> - Testing, a quick glance over the different types of testing, tools, and how to automate it
> - The Build Process, why one step builds are important, how everything comes together when building, different tools you can use

Their publisher replied to my proposal the next day, and we began dancing around the proposal, putting together a table of contents. As time went on, I progressively realized I literally had **no freaking idea** how to write a book. That's where Manning's editors came in, they've been great so far, I've learned _a lot_ about the process and book writing itself, and I believe I'm becoming better at pushing keys **in the appropriate order** on my keyboard.

The book was originally named _Build-First JavaScript Applications_, which was pretty confusing. After a call where we first discussed the topics I'd be writing about in the book, I put together a _formal proposal_, where the description still roughly matches the book in its current form.

> ### Book Description
>
> Build-First JavaScript Applications has a two-headed mission. It will teach the reader how to tackle application development using a well thought-out build process from the get-go. On a second level, readers will gain insight into applying these concepts to JavaScript and Node applications.
>
> The book sets the bar with a section about **build processes**. The reader will learn what a build process is, and why he should be interested in implementing one. He’ll be introduced to tasks, environments and deployments, and learn how to keep a productive development environment.
>
> A second section of the book focuses on **managing complexity in JavaScript**, introducing topics such as asynchronous programming and dependency management. We’ll look at keeping our code testable, and learn strategies for testing our modules.
>
> These concepts are put to test in the third section, **application design**. This section will describe and design a moderately complex application, and guide the reader through its development. Eventually, we will have applied all the knowledge gathered in the previous chapters into a tangible application that can be accessed online, and the reader will have embraced that knowledge.

The table of contents has been reworked quite a bit by now. Node has been relayed to the background, mostly regarded as a dependency for Grunt. However, parts of the book which require a back-end use Node for that. Deployments are also explained using Node. Testing, however, is mostly dedicated to front-end efforts.

  [1]: http://i.imgur.com/idiCvhM.jpg

TAGS: buildfirst book recommended-reading build front-end
