# Package Authoring with Paqui

Creating client-side JavaScript packages is increasingly becoming a painful endeavor. We need to publish our package to different repositories such as [bower](http://bower.io/ "Bower: A Package Manager for the Web"), [component](http://component.io/ "Component: Modular JavaScript Framework"), and [npm](https://npmjs.org/ "Node Packaged Modules"), and there are others! Crazy. People might be using [volo](http://volojs.org/ "volo"), [jam](http://jamjs.org/ "jam"), or [Ender](http://ender.jit.su/ "Ender")... _Have I named enough yet?_

Then there's building the package for human consumption. That's where things get really cute. You have [CommonJS modules](http://wiki.commonjs.org/wiki/Modules "CommonJS Modules Spec") and [browserify](http://browserify.org/), AMD modules with [Require.js](http://requirejs.org/ "Require.js Organization"), plain-old raw  JavaScript, and a bunch of other "input" formats. There is plenty that can be done in that field, and plenty is done indeed. The output isn't that complicated, but everyone expects you to provide at least the minified (and unminified) code for your module tighly packaged in a single `.js` file.

Solutions such as [Grunt](http://gruntjs.com/ "Grunt: The JavaScript Task Runner") or [yeoman](http://yeoman.io/ "Yeoman Modern Worflows") kind-of solve these problems, but leave you but a bunch of code that you might have no idea how it works.

[Paqui](https://github.com/bevacqua/paqui "Packager-agnostic package manager for front-end developers") solves these issues for us, without leaving undesired artifacts behind. That's the nice thing of being **tailored for open-source front-end package development**! In this article we'll examine how to make use of Paqui in our package development workflow, and learn how we can extend its behavior, _if we need to_.

[![paqui.png][1]](https://github.com/bevacqua/paqui "Packager-agnostic package manager for front-end developers")

In essence, Paqui takes care of three things:

- Scaffolding
- Building
- Distributing

Let's go through them in turn.

# Paqui Flow

The first step is actually [creating a repository](https://github.com/new "Create a New Repository on GitHub") on GitHub. Paqui will take care of everything else, so you should leave **Initialize** _unchecked_.

![github.png][2]

Paqui requires a one-time only installation step, let's go ahead and type that into our terminal now.

```shell
npm install -g paqui
```

Ready! Okay, let's see how this works. The first command we'll look at is `paqui init`.

```shell
paqui init paqui-dummy --remote https://github.com/bevacqua/paqui-dummy.git
```

I used the `--remote` option to have Paqui _add the remote and push to it_ for me, otherwise I'd need to do that by hand.

This command will create a `paqui-dummy` directory and set up our component there. If we create the directory ourselves, and `cd` into it, we could just `paqui init .`. Before doing anything, Paqui will ask us a few questions, but it'll provide default answers to the best of its knowledge.

![init.png][3]  
> _I used the `--lean` option to avoid verbose `git` command output_

At this point we can start hacking away at our package. If we didn't change any of the defaults, the entry point will be `src/main.js`.

## Building

By default, we are going to write our code under Common.JS (using `module.exports` and `require`). If you scroll up a bit you'll see one of the questions Paqui asked was `transform`, where I answered with the default: `universal,banner`. This is where the extensible nature of Paqui becomes apparent.

> The only thing that's governing the way we write our module is the **transformation extensions we apply to our sources** during our builds.

As you can imagine, `universal` means that we are able to write Common.JS modules in our source code, and the `universal` transform will take that code, put it through `browserify`, and turn it into a client-side package that supports [the UMD definition](https://github.com/umdjs/umd "Universal Module Definition").


Paqui is going to generate a couple of files during builds, in this case they'll be called `paqui-dummy.js` and `paqui-dummy.min.js`. These will be the files that package consumers will pay attention to.



  [1]: http://i.imgur.com/AksDJZW.png
  [2]: http://i.imgur.com/XAlzQ8V.png "Creating the repository on GitHub"
  [3]: http://i.imgur.com/8cOfqWU.png "Initializing a repository with Paqui"
