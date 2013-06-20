# CSS For Dummies #

Web design today is hard to get right. I've been meaning to talk about front-end design for a while, but I couldn't get the subject _quite right_. Seeing how detailing the [underlying browser technology](/2013/06/10/uncovering-the-native-dom-api "Uncovering the Native DOM API") in JavaScript, I figured I'd do the same for [CSS](https://en.wikipedia.org/wiki/Cascading_Style_Sheets "Cascading Style Sheets").

I'll be taking a different approach, though. Rather than explain what libraries do, I'll try explaining why a need for them was born, and walk you through the most basic stuff, such as selectors, and follow up by tackling complex topics such as fonts, [Bootstrap](http://twitter.github.io/bootstrap/ "Twitter Bootstrap CSS Framework"), pre-processing, and more.

## Fundamentals ##

CSS was born out of necessity. The necessity to _separate content from presentation_. The idea was to put behind stuff like `<body bgcolor='black'>`, and work towards a more layered approach. DOM elements would get CSS classes (more on that later), and in our CSS, we would define style rules, such as `background-color`, or `font-size`.

The previous example would be redefined as:

```html
<head>
    <style>
    body {
      background-color: black;
    }
    </style>
</head>

<body>
```

The CSS is contained in a `<style>` block, or it can be alternatively be placed in an external stylesheet. Like so:

```css
/* style.css */

body {
  background-color: black;
}
```

```html
<head>
    <link rel='stylesheet' href='style.css'>
</head>
    
<body>
```
    
Alternatively, you can set styles in DOM attributes, or through JavaScript. The former is hardly ever recommended, with an _exception_ being made in the case of _HTML emails_. The latter is sometimes useful when _calculations are needed_, but it's generally bad practice otherwise. JavaScript is useful for toggling (adding and removing) CSS classes on DOM elements, to denote a change in state.

```html
<body style='background-color: black;'>
```

```js
document.body.backgroundColor = 'black';
```

Note how the notation changes in JS. As a general rule, style properties are [camel-cased](http://en.wikipedia.org/wiki/CamelCase "Camel Casing - Wikipedia") in JavaScript, and hyphenated in CSS.

#### Classes ####

We mentioned _classes_ earlier. Classes can be styled in CSS style sheets by prefixing them with a dot.

```css
.my-class {
  background-color: black;
}
```

They can be added to DOM elements using the `class` attribute. _Multiple classes_ can be added to each element.

```html
<body class='my-class'>

<body class='my-class that-one another'>
```

#### The Cascading Aspect ####

Thus far, we've been discussing _Style Sheets_, but remember, these are also **Cascading**, hence CSS. So what does _cascading_ imply?

Cascading means that **order matters**. That is to say, styles follow a [convoluted](http://www.w3.org/TR/CSS2/cascade.html "Cascading and Inheritance in CSS - W3") order of precedence rule-set. This order of precedence can be overridden appending `!important` to the end of our style values, but _this is a hack_, and **not recommended**.

Instead, we should design our style sheets so that our rules cascade into each other. If we find ourselves resetting a bunch of properties from a _less specific selector_, in a more specific one, that should signal trouble (more on selectors in a minute).

#### Selectors ####

Selectors are what we use in CSS to identify the elements we want to style with a particular set of rules. If you are a JavaScript developer, you probably already used selectors with jQuery, or with the [native methods](/2013/06/10/uncovering-the-native-dom-api "Uncovering the Native DOM API") that underline its selector engine.

A quick overview of selectors:

```css
// basic selectors

#element-id // elements with the given id
.class-name // elements with the given class name
span // span DOM elements
[href] // elements with an href attribute
[data-foo=bar] // data-foo property with value equal to 'bar'
* // 'star selector', matches everything
:focus // the currently focused element
:hover // elements under the mouse pointer

// selectors can be chained using spaces or special 

span strong // strong tag, one of its parents is an span
span > strong // strong tag, its immediate parent is an span
.title + span // span tag immediately following a .title element
```

You can go deeper into selectors looking at the [W3 recommendation](http://www.w3.org/TR/CSS21/selector.html "CSS 2.1 Selectors - W3").

#### CSS Properties ####

If you want to learn the different CSS properties you can apply, I'll recommend a few links.

- [CSS 2.1 properties](http://www.w3.org/TR/CSS21/propidx.html "CSS 2.1 Full Property Table - W3") in the W3 recommendation
- [css3files.com](http://www.css3files.com/ "CSS3 Files") explains what's new in CSS 3
- [css3please.com](http://css3please.com/ "CSS3 Please!") contains some cross-browser CSS rules

You can always learn more about CSS by subscribing to sites such as [css-tricks.com](http://css-tricks.com/ "CSS Tricks by Chris Coyier")

#### Cascading Issues ####

Earlier on I mentioned cascading should be _natural_. Lets look at an unnatural example.

```css
.button {
    border: 3px solid #ffc;
    border-radius: 5px;
    text-shadow: #999 0 1px;
    background-color: #fcc;
    padding: 8px;
    color: #f00;
}

.button.flat {
    border-radius: none;
    text-shadow: none;
}
```

Generally speaking, we'd be better off declaring this using _a more natural approach_.

```css
.button {
    border: 3px solid #ffc;
    background-color: #fcc;
    padding: 8px;
    color: #f00;
}

.button.rounded {
    border-radius: 5px;
    text-shadow: #999 0 1px;
}
```

If the reason for this isn't immediately apparent, try thinking about this in a broader scope, where you have _tons_ of overriding classes and many of them _don't want the 3D appearance_.

## History of CSS ##

Now that we know the basics about _what CSS is_, and how to apply it to _style the web_, lets dive into a **history lesson** for a while. Or, at the very least, a few milestones in CSS history, so that we better understand the current state of the web.

-- why css reset

#### CSS Reset ####

-- normalize.css


layout
design
css 2.1
css 3
media queries
css reset + css normalize
css grids
fonts
bootstrap
pre-processors
