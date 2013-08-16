# polyscript [![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges) #

Write JavaScript in your JavaScript using polyscript!

*Disclaimer: this is, as far as I know, almost always a very bad idea, with the exception of some special use cases - namely, performance optimisation when dealing with data of arbitrary dimensions. Use as a **last resort**.*

## Example ##

Here's a trivial example for adding arrays together:

``` python
var sum2d = sum(2)
var sum3d = sum(3)

sum2d([1, 1], [2, 3]) // [3, 4]

@function sum(d)(a, b) {
  var c = []
  <% for (var i = 0; i < d; i += 1) { %>
    c[@i] = a[@i] + b[@i]
  <% } %>
  return c
}
```

Essentially, polyscript gives you a special type of function which is prefixed
with a `@` takes two sets of arguments. This function, when called, returns a
new function that's transformed according to a syntax very similar to
[EJS](http://embeddedjs.com/). In fact, part of the transpiler's code is a
modified version of
[TJ Holowaychuk's implementation](https://github.com/visionmedia/ejs).

The first set of arguments will get passed to the generated code, and the
second set are used by the generated function. `@i` is just shorthand for
`<%= i %>`.

## Installation ##

``` bash
$ npm install polyscript
```

## Usage ##

Using polyscript as a module, you get one function: it takes a string in
polyscript and converts it to javascript.

``` javascript
var ps = require('polyscript')
var fs = require('fs')

console.log(
  ps(fs.readFileSync(__filename))
)
```

You can use it as a CLI tool by installing it globally - it will either convert
the file you specify as the first argument or read from stdin:

``` bash
$ polyscript index.pjs > index.js
$ cat index.pjs | polyscript > index.js
```

## Why? ##

Take a vanilla JavaScript function for adding arrays of arbitrary lengths
together:

``` javascript
function sum(a, b) {
  var c = []
  for (var i = 0; i < a.length; i += 1) {
    c[i] = a[i] + b[i]
  }
  return c
}
```

If you knew you were only handling arrays either 2 or 3 elements, you can just
swap it out for this and skip on the for loop:

``` javascript
function sum2d(a, b) {
  return [a[0] + b[0], a[1] + b[1]]
}

function sum3d(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}
```

Both of these approaches would ordinarily suffice, unless you want to squeeze
more performance from these functions while keeping some flexibility and
avoiding duplication. A compromise you could take would be
provide a function which takes a specific number of dimensions and returns a
generated function tailored to your needs. This is a lot harder to read though:

``` javascript
function sumnd(d) {
  return Function(
    'return function sum'+d+'(a, b) {'
  + '  return ['
  + '  ' + ngroup(d, npair).join(', ')
  + '  ]'
  + '}'
  )()
}

function npair(d) {
  return 'a['+d+'] + b['+d+']'
}

function ngroup(n, fn) {
  var a = []
  for (var i = 0; i < n; i += 1) {
    a.push(fn(n))
  }
  return a
}
```

Here's the original polyscript example again:

``` python
@function sum(d)(a, b) {
  var c = []
  <% for (var i = 0; i < d; i += 1) { %>
    c[@i] = a[@i] + b[@i]
  <% } %>
  return c
}
```

It's essentially taking the function-generation-via-strings approach under the
hood, but hiding it away into a more compact syntax. It's still a little
confusing, but much easier to read, and structured almost exactly like the
original generic example.

You can also treat this more or less the same as you would a normal function:
it gets hoisted, can be passed around as a variable, bound, gets a lexical scope, etc.

These examples are fairly trivial - for an actual use case see the code
of some of the [ndarray modules](https://npmjs.org/search?q=ndarray) on
[npm](http://npmjs.org/).

## Known Issues ##

I haven't spent much time with this yet - feel free to fix these and submit a
pull request :)

* `@function`s can be created in comments/strings.
* `@i` works from strings - only `<%= i %>` should work.

## License ##

(The MIT License)

Copyright (c) 2013 Hugh Kennedy &lt;hughskennedy@gmail.com&gt;

Original EJS implementation copyright (c) 2009-2010 TJ Holowaychuk &lt;tj@vision-media.ca&gt;
