# Working with Native Arrays

In JavaScript, arrays can be created with the `Array` constructor, or using the `[]` convenience shortcut, which is also the preferred approach. Arrays inherit from the `Object` prototype and they haven't a special value for `typeof`, they return `'object'` too. Using `[] instanceof Array`, however, returns true. That being said, there are also _Array-like objects_ which complicate matters, [like the `arguments` object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions_and_function_scope/arguments "The arguments object - MDN"). The `arguments` object is not an instance of `Array`, but it still has a `length` property, and its values are indexed, so it can be looped like any Array.

In this article I'll go over a few of the methods on the `Array` prototype, and explore the possibilities each of these methods unveil.

- Looping with `.forEach`
- Asserting with `.some` and `.every`
- Stacks and queues with `.pop`, `.push`, `.shift`, and `.unshift`
- Model mapping with `.map`
- Querying with `.filter`
- Ordering with `.sort`
- Computing with `.reduce`, `.reduceRight`
- Copying a `.slice`
- The power of `.splice`
- Lookups with `indexOf`
- The `in` operator
- Going in `.reverse`
- Subtleties in `.join` and `.concat`
- Memoization

![console.png][1]

### Looping with `.forEach`

This is one of the simplest methods in a native JavaScript Array. [Unsurprisingly unsupported™](http://kangax.github.io/es5-compat-table/#Array.prototype.forEach "ECMAScript 5 compatibility table") in IE7 and IE8.

`forEach` takes a callback which is invoked once for each element in the array, and passed three arguments.

- `value` containing the current array element
- `index` is the element's position in the array
- array is a reference to the array

```js
['_', 't', 'a', 'n', 'i', 'f', ']'].forEach(function (value, index, array) {
	this.push(String.fromCharCode(value.charCodeAt() + index + 2))
}, out = [])

out.join('')
// <- 'awesome'
```

We can't break `forEach` loops, and throwing exceptions wouldn't be very sensible. Luckily, we have other options available to us in those cases where we might want to short-circuit a loop.

### Asserting with `.some` and `.every`






  [1]: http://i.imgur.com/z0Hun2i.png