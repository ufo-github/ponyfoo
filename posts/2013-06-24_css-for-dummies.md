# CSS For Dummies #

Web design today is hard to get right. I've been meaning to talk about front-end design for a while, but I couldn't get the subject _quite right_. Seeing how detailing the [underlying browser technology](/2013/06/10/uncovering-the-native-dom-api "Uncovering the Native DOM API") in JavaScript, I figured I'll do the same for [CSS](https://en.wikipedia.org/wiki/Cascading_Style_Sheets "Cascading Style Sheets").

I'll be taking a different approach, though. Rather than explain what libraries do, I'll try explaining why a need for them was born, and walk you through the most basic stuff, such as selectors, and follow up by tackling complex topics such as fonts, [Bootstrap](http://twitter.github.io/bootstrap/ "Twitter Bootstrap CSS Framework"), pre-processing, and more.

## Fundamentals ##

CSS was born out of necessity. The necessity to _separate content from presentation_. The idea was to put behind stuff like `<body bgcolor='black'>`, and work towards a more layered approach. DOM elements would get CSS classes (more on that later), and in our CSS, we would define style rules, such as `background-color`, or `font-size`.

The previous example would be redefined as:
  
    <head>
        <style>
        body {
          background-color: black;
        }
        </style>
    </head>
    
    <body>
    
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

### Classes ###

We mentioned _classes_ earlier. Classes can be styled in CSS style sheets by prefixing them with a dot.

```css
.my-class {
  background-color: black;
}
```

They can be added to DOM elements using the `class` attribute. _Multiple classes_ can be added to each element.

```
<body class='my-class'>

<body class='my-class that-one another'>
```

### Selectors ###







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
