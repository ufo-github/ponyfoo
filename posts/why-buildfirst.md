# Why Should You Build First?

Build First is a set of principles I've collected over the years and influenced by several sources. [The Lean Startup](http://www.amazon.com/dp/0307887898 "The Lean Startup book, by Eric Ries") has already become a classic, taking the Toyota Production System lean practices to the software development world. These practices [can be summed up](/2013/07/29/lean-development-principles "Lean Development Principles") in what Ries calls the build-measure-learn feedback loop. Rather than building out an application and then _hoping_ for the best, Eric prompts us to collect feedback from our humans, using the [Build-Measure-Learn](http://blog.ponyfoo.com/2013/07/29/lean-development-principles "Lean Development Principles article on Pony Foo") feedback loop, and then decide which features are best _for them_. Following this _iterative approach_ to development is similar to Agile, but with the difference that any feature should be immediately releasable. Kanban is one way to approach lean development, and it has a number of benefits over traditional Agile.

- Deployments are made easier by deploying more often, maybe even several times a day
- Feedback on which features customers actually engage with gets to us faster
- Minor fixes don't have to wait until a release day a week from now, because those happen whenever we need one
- Hot fixes can be pushes through the ranks immediately
- Recently introduced bugs can be quickly identified because features are released in short bursts, rather than commiting huge change lists to each individual release

Build First is also influenced by the [12 Factor App Manifest](http://12factor.net "Heroku's 12 Factor App manifest"), written by one of Heroku's co-founders. In this document, Wiggins details their approach to application architecture, configuration, scaling, and deployment. **This is a read I could not recommend more often.** Granted, working in Node.js and open-source projects had already taught me a lot about the topic, but it helped me further advance my treatment of secure configuration and scalable application design. Below is one of the subtle (yet, _key_) take-aways I came up with, after working in the open-source JavaScript community for a while, reading and following Heroku's _12 Factor App_ manifest.

> Write closed source projects as if they might be open-sourced overnight

That is, don't assume the closed-source nature of your project to be secure enough for you to place sensitive data such as API credentials or email authentication information directly in the project. Instead, keep private data in environment variables, or use encryption if you want to keep it in the repository safely. This won't only help you write code that's safer, but it'll also make the code easier to scale, too!

Then there's the [Pragmatic Programmer](http://www.amazon.com/Pragmatic-Programmer-Journeyman-Master/dp/020161622X "Find it in Amazon"), this is a book [I've recommended in the past](/2013/05/21/recommended-reading "Recommended Reading"), ... (ref. other mentions of pragprog)

- automate everything, right off the bat
- less headaches, leaner process
tighten your feedback loop
better performance (min concat)
more productive (sprites, less gruntwork)
- automated testing is super easy
-deployments in a single step
- database rollbacks, you name it!
- it's easier with Grunt

