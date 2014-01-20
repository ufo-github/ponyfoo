# My First Gulp Adventure

I decided to take a gulp of Gulp and use it in one of my latest projects, to help me with releases. I wrote a Gulpfile, which lets me write some code to define the tasks enumerated below.

- Lint my source code
- Run unit tests
- Clean my distribution directory
- Build the distribution files, minified and otherwise
- Bump the package version for `npm` and `bower`
- Push a new tag to `git`, to update the Bower version
- Publish the updated version to `npm`

In this article I aim to explain what I did, how I did it, and the reasons why I made some of the choices that I did. The only real problem I had to do with synchronicity. I felt it would be interesting walking you through the process. It may help you get started with Gulp!

![rocket.png][1]

  [1]: http://i.imgur.com/ApIcjlI.png "The Gulp Rocket!"

By default, Gulp tasks are asynchronous, and the "dependency system", where you fire pre-requisite tasks before a given task is able to run, feels verbose and unlike the rest of Gulp.

```js
gulp.task('name', ['dep1', 'dep2'], function () {
  // the task
});
```

- tasks
- a?sync issues
- npm publish task
- travis-ci integration

- bonus: write a short post about testling integration
