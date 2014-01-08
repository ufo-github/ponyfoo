# Gulp, Grunt, Whatever

[Gulp][1] is a recently spawned streaming build system which shows a lot of promise. It brings [a really terse code-base][2] to the table, which you can actually walk through _in under ten minutes_. That's a lot to say when pitching it against Grunt, which is [quite larger][3] than that.

Remember Grunt? I've [blogged about it extensively][4] in the past, and I'm [even writing a book][5] which features Grunt as its go-to build tool. It's an awesome _tool_, you should try it some time.

[Some people][6] claim that Grunt will eventually be gulped by Gulp, and surely more will follow. I find this to be [outrageous, egregious, preposterous][7]. It's not as clear cut, Grunt has _a lot of benefits_ over Gulp, and so does Gulp over Grunt.

In this article I aim to **introduce Gulp**, as it's fairly new, having been released _around 6 months ago_. Then, _I'll compare it with Grunt_, pointing out what tool does what better, and why.

[![gulp.png][8]][1]


  [1]: http://gulpjs.com/ "Gulp Streaming Build System"
  [2]: https://github.com/gulpjs/gulp/ "gulpjs/gulp on GitHub"
  [3]: https://github.com/gruntjs/grunt "gruntjs/grunt on GitHub"
  [4]: /search/tagged/grunt "Posts tagged 'grunt' on Pony Foo"
  [5]: http://bevacqua.io/buildfirst "JavaScript Application Design: A Build First Approach"
  [6]: http://www.100percentjs.com/just-like-grunt-gulp-browserify-now/ "And just like that Grunt and RequireJS are out, it’s all about Gulp and Browserify now"
  [7]: http://www.youtube.com/watch?v=kRhW_zMlf0Y "Jackie Chiles on Seinfeld"
  [8]: http://i.imgur.com/yFeBvMO.png "gulp.png"
  
# Introducing [Gulp][1]

You might want to kick things off by [going through the README][2], although I would reccomend you skim through the source code, as there aren't really a lot of surprises there, just some well thought-out, and concise code.

As you might've read while skimming over their documentation, installing Gulp is very reminiscent of what you had to do with Grunt.

- Have a `package.json`
- `npm install -g gulp`
- `npm install --save-dev gulp`
- Create a `gulpfile.js`
- `gulp`

At this point, the main difference with Grunt is that they didn't take their **CLI** out of core _(at least not yet)_, which might confuse you if you don't [understand global installs][3] in `npm`.

Before heading to a sample gulpfile, let's look at how the API looks like. There's five methods, and that's all you need. That's awesome, a concise API really helps keep the module focused on just what it's good at, processing build tasks.

- `.src(globs[, options])` takes a [glob][4] and returns an input stream
- `.dest(path)` takes a path and returns an output stream
- `.task(name[, deps], fn)` defines a task
- `.run(tasks...[, cb])` runs tasks
- `.watch(glob [, opts], cb)` watches the file system

I must say, that API is just awesome. Let's look at a simple task to compile Jade templates, taken from Gulp's documentation. Here, `jade()` and `minify()` are Gulp plugins, we'll get to those in a minute.

```js
gulp.src('./client/templates/*.jade')
  .pipe(jade())
  .pipe(minify())
  .pipe(gulp.dest('./build/minified_templates'));
```

There isn't much boilerplate code involved, due to the fact that we're just writing code as opposed to putting together a configuration object.

In Grunt you'd need some boilerplate to get this thing going, such as loading `npm` modules with a rather weird `grunt.loadNpmTasks` method, creating a task alias that combines the required tasks, and configuring each of them to do what you need. One of the issues with Grunt which is solved by Gulp is that a single monolithic configuration object forces you to jump through hoops in order to achieve the results you want. If you have a workflow which copies a file and minifies something else, and another one which copies an unrelated file, the `copy` task configuration ends up with two completely unrelated `copy` operations, albeit under different targets.

Gulp does a good job of showing how code over configuration can help prevent such an scenario where configuration ends up being confusing and hard to digest.

## Savoring a `gulp`

Consider this short sample `gulpfile.js`, adapted from what's on the docs for Gulp.

```js
var gulp = require('gulp');
var uglify = require('gulp-uglify');

gulp.task('scripts', function() {
  // Minify and copy all JavaScript (except vendor scripts)
  gulp.src(['client/js/**/*.js', '!client/js/vendor/**'])
    .pipe(uglify())
    .pipe(gulp.dest('build/js'));

  // Copy vendor files
  gulp.src('client/js/vendor/**')
    .pipe(gulp.dest('build/js/vendor'));
});

// The default task (called when you run `gulp`)
gulp.task('default', function() {
  gulp.run('scripts');

  // Watch files and run tasks if they change
  gulp.watch('client/js/**', function(event) {
    gulp.run('scripts');
  });
});
```

Even if you don't know Node streams, this is pretty readable, right? I'd argue it's more readable than a `Gruntfile.js` which does the same things, because in this case we're simply following the code, and guessing what it does becomes much easier then. Take out comments stating the obvious, and you've got yourself a terse `gulpfile.js`.

The fact that Gulp provides a reasonable `.watch` implementation as part of their core API is also encouraging, as that's a key piece of functionality which gives a lot of value to a build system during development. Support for [asynchronous task development][8] feels much more integrated in Gulp than it does in Grunt, where targets really complicate matters when passing values to tasks.





## Dissecting `/Gr?u(nt|lp)/`

Let's see where the comparison between both task runners breaks down. Gulp is streams all the way down, almost as if you were shell scripting. That is, if you "get" [Node streams][6]. Otherwise, you're going to have a bad time.

[![streams.jpg][5]][6]

That being said, if you're a Node person, it's hard to ignore the audacity with which Gulp has you set up a build flow using code, rather than configuration, like Grunt does.


..

## Gulp _won't sip out_ Grunt

- doesn't solve any fundamental problems (grunt already does everything and more)
- creates new ones (barrier of entry for non-noders, understanding streams)
- https://gist.github.com/substack/8313379

<blockquote class="twitter-tweet" lang="en"><p>Grunt vs. Gulp: both serve different needs &amp; can coexist happily. See: <a href="http://t.co/fQ5G8HDNwl">http://t.co/fQ5G8HDNwl</a> &amp;&amp; <a href="https://t.co/joUVeRqj8T">https://t.co/joUVeRqj8T</a>. We&#39;ll support both</p>&mdash; Addy Osmani (@addyosmani) <a href="https://twitter.com/addyosmani/statuses/420870024379637760">January 8, 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

- http://www.reddit.com/r/javascript/comments/1uk7we/and_just_like_that_grunt_is_out_its_all_about/cej29ig
- https://plus.google.com/+sindresorhus/posts/BvPrVz5fbcz

## The boar isn't grunting as hard, though

Grunt, however, might _drown on its own_. It sit on `0.4.1` for ages, before moving to an unimpressive `0.4.2` release, and it doesn't seem to be going places now, either. Activity on the [@gruntjs][7] Twitter account is kind of flat-lining these days, and that's not a good sign, either.

  [1]: http://gulpjs.com/ "Gulp Streaming Build System"
  [2]: https://github.com/gulpjs/gulp/ "gulpjs/gulp on GitHub"
  [3]: http://blog.nodejs.org/2011/03/23/npm-1-0-global-vs-local-installation/ "npm 1.0: Global vs Local installation"
  [4]: https://github.com/isaacs/node-glob "isaacs/node-glob on GitHub"
  [5]: http://i.imgur.com/pnEIqGO.jpg
  [6]: http://www.youtube.com/watch?v=lQAV3bPOYHo "Harnessing the awesome power of streams"
  [7]: https://twitter.com/gruntjs "@gruntjs on Twitter"
  [8]: https://github.com/gulpjs/gulp#async-task-support "Asynchronous Task Support in Gulp"

build grunt gulp
