# Organizing your CSS #

Now that we've laid [the basics](/2013/06/24/css-for-dummies "CSS For Dummies") in the cascading land of awesomeness that is CSS, it's time to move forward and take a deeper look at _organization and tooling_.

Any decently-sized codebase, even CSS, needs some sort of organization in order to keep us from going insane. Pre-processing, and a few ground rules for style writing, will help us achieve the _level of organization **required** in higher level applications_.

## Organization ##

Before we jump onto template scaffolding with bootstrap, I wanted to go over some tips to improve the organization in the way we write our CSS code. Take these as general rules, apply them _as you deem necessary_.

- Use classes for styling. Whenever possible, _avoid using element IDs_, attribute values, and tag names
- Try not to nest style rules _too deeply_. To prevent complexity, limit yourself to _one or two levels_ of nesting
- Avoid _magic pseudo-selectors_ such as `:nth-child` or `:nth-of-type`. Use an extra class in your markup, instead
- Don't overqualify selectors. i.e: `div.foo.bar`, when you could use `.foo`
- Prefix classes with `js-` when referenced by JavaScript code
- Avoid styling `js-` classes
- Toy with the idea to use `box-sizing: border-box` [everywhere](http://www.paulirish.com/2012/box-sizing-border-box-ftw/ "* { box-sizing: border-box; } FTW")
- Attempt separating layout styling concerns from design concerns. Keep _separate stylesheets_

These are just a few ground rules, feel free to add your own or _adapt_ these to your own needs. You might want to use [SMACSS](http://smacss.com/ "SMACSS Style Guide") as your _guiding light_.

## Lint your CSS! ##

If you have a large enough project, CSS can get out of hand as easily as JavaScript, or even more so, because developers seldom pay attention to CSS. You are [already using JSHint](/2013/03/22/managing-code-quality-in-nodejs "Managing Code Quality in NodeJS"), which is great. If you really want to take your codebase to the next level, you should _at least consider_ linting the CSS, too.

Currently, you can use [CSSLint](https://github.com/stubbornella/csslint "CSSLint on GitHub") as your lint tool. If you are using LESS, you are in luck! [RECESS](https://github.com/twitter/recess "Twitter RECESS on GitHub") will let you lint your LESS code directly.

**Ideally**, you should include a _lint task_ for CSS in your [build process](/2013/05/22/understanding-build-processes "Understanding Build Processes").

## Pre-processors ##

Pre-processors allow us to keep our stylesheets [DRY](http://en.wikipedia.org/wiki/Don't_repeat_yourself "Don't Repeat Yourself Principle"). They also let us perform calculations in our layout measurements, or do color shifting.

Quite probably though, the most useful feature of CSS pre-processors is the ability to use mixins, reusable functions that allow us to write cross-browser styles without having to type them time and again, risking typos and duplicating our code.

The most popular flavors of CSS pre-processing probably are:

- [SASS](http://sass-lang.com/ "Syntactically Awesome Stylesheets"), from the universe of Ruby and [CoffeeScript](http://coffeescript.org/ "CoffeScript language")
- [Stylus](http://learnboost.github.io/stylus/ "Stylus pre-processor"), from the awesome [LearnBoost](https://github.com/LearnBoost "LearnBoost on GitHub")
- [LESS](http://lesscss.org/ "LESS CSS language"), still rocking it

Lets do a quick comparison of the three:

|              | SASS         | Stylus       | LESS         |
|-------------:|:-------------|:-------------|:-------------|
| Syntax       | CSS-like     | Customizable | CSS-like     |
| Compiler     | Ruby gem     | Node package | JavaScript   |
| Verbosity    | Higher       | Lowest       | Regular      |
| Source       | [GitHub](https://github.com/nex3/sass "SASS on GitHub") | [GitHub](https://github.com/learnboost/stylus "Stylus on GitHub") | [GitHub](https://github.com/cloudhead/less.js "LESS on GitHub") |
| Framework    | [Compass](http://compass-style.org/ "Compass CSS Authoring Framework") | [Fluidity](https://github.com/InkSpeck/fluidity "Fluidity Framework") | [Bootstrap](twitter.github.com/bootstrap/ "Twitter Bootstrap") |

All three pre-processors share similar syntax and features when it comes to color functions, mixins, and variables. You can find a more detailed, _feature by feature_ comparison [here](http://net.tutsplus.com/tutorials/html-css-techniques/sass-vs-less-vs-stylus-a-preprocessor-shootout/ "SASS vs LESS vs Stylus").

I should mention _all three_ are readily available as grunt tasks on npm.

> In my opinion, it depends on what you want to do. If you are going to use a full-fledged CSS framework, I'd go with LESS, because Bootstrap is _a clear winner_ in the field.

> If you are going to use the framework as is, or not going to use one, you could probably do with Stylus. It's clean looking syntax is [really appealing](https://gist.github.com/paulmillr/2005644 "Gist showing simplicity of Stylus").

SASS used to be regarded as _a superior language_ than LESS. Today, they are _very similar_. SASS feels a _little more verbose_, though. That, coupled with the fact that **Bootstrap** is powered by LESS, makes me choose _LESS over SASS_ with little hesitation.

## Twitter Bootstrap ##

[Bootstrap](http://twitter.github.io/bootstrap/ "Twitter Bootstrap Framework") is a CSS framework, which _encompasses_ a lot of the practices we mentioned earlier. It does:

##### Rapid Prototyping #####

We've all been there before. Trying to get a design right, but instead, we _wasted our time_ dealing with `float` issues, with margins, paddings, and footers that wouldn't stick to the bottom of our page.

Bootstrap provides an [scaffolding module](http://twitter.github.io/bootstrap/scaffolding.html "Bootstrap Scaffolding") that allows us to very quickly set up the basics for our layout. The scaffolding module provides us with a grid system that allows us to quickly place elements on our designs with ease.

At this point, you'll be probably better off [downloading Bootstrap](http://twitter.github.io/bootstrap/assets/bootstrap.zip "Download bootstrap.zip") and playing around with it for a while. But I'll try my best to give you a reasonable example.

This grid system uses 12 columns. These columns have a fixed width, and allow you to quickly throw together a multi-column layout:

```html
<div class="row">
    <div class="span3">Menu</div>
    <div class="span9">Content!</div>
</div>
```

You can also nest these columns, and it will still work, just make sure to use _a new row element_:

```html
<div class="row">
    <div class="span3">Menu</div>
    <div class="span9">
        <h1>Articles</h1>
        <div class="row">
            <div class="span6">Article 1</div>
            <div class="span6">Article 2</div>
        </div>
        <div class="row">
            <div class="span6">Article 3</div>
            <div class="span6">Article 4</div>
        </div>
    </div>
</div>
```

picking the right font / pair
