# Why Should You Build First?

Build First is a set of principles I've collected over the years and influenced by several sources. [The Lean Startup](http://www.amazon.com/dp/0307887898 "The Lean Startup book, by Eric Ries") has already become a classic, taking the Toyota Production System lean practices to the software development world. These practices [can be summed up](/2013/07/29/lean-development-principles "Lean Development Principles") in what Ries calls the build-measure-learn feedback loop. Following this iterative approach to development is similar to Agile, but with the difference that any feature should be immediately releasable. Kanban is one way to approach lean development, and it has a number of benefits over traditional Agile.

- Deployments are made easier by deploying more often, maybe even several times a day
- Feedback on which features customers actually engage with gets to us faster
- Minor fixes don't have to wait until a release day a week from now, because those happen whenever we need one
- Hot fixes can be pushes through the ranks immediately
- Recently introduced bugs can be quickly identified because features are released in short bursts, rather than commiting huge change lists to each individual release



Build First is also influenced by the [12 Factor App Manifest](http://12factor.net "Heroku's 12 Factor App manifest"), written by one of Heroku's co-founders. It describes what it takes, in his his opinion, to create a fault tolerant, easily scalable application. 


- automate everything, right off the bat
- less headaches, leaner process
tighten your feedback loop
better performance (min concat)
more productive (sprites, less gruntwork)
- automated testing is super easy
-deployments in a single step
- database rollbacks, you name it!
- it's easier with Grunt

