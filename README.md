SwanJS
================================================================================
SwanJS is a simple and yet powerful expression language for JavaScript which
runs in both the browser and NodeJS.

Example:
```js
swan = require('swan-js');
evaluate = swan.parse( "3 * x" );
context = swan.createContext({x:10});
value = await evaluate(context);         // 30
```

You can install SwanJS via npm:

```
npm install @onlabsorg/swan-js
```


Syntax
--------------------------------------------------------------------------------

A Swan expression is simply a sequence of binary operations 
(operand operator operand operator operand ...), eventually grouped with 
parenthesis (...), square braces [...] or curly braces {...}.

The available binary operations are:

- Arithmetic operations: `x + y`, `x - y`, `x * y`, `x / y`, `x % y`, `x ^ y`
- Comparison operations: `x == y`, `x != y`, `x > y`, `x >= y`, `x < y`, `x <= y`
- Logic operations: `x & y`, `x | y`
- Conditional and alternative operations: `x ? y`, `x ; y`, or combined `x ? y ; z` 
- Pairing operation: `x , y`
- Application (function call or item reference): `x y`
- Function definition: `x -> y`
- Composition operations: `g << f`, `f >> g`
- Assignment operations: `name = x`, `name: x`
- Sub-contexting operation: `x.y`

The types of grouping available are:

- Parenthesis to alter evaluation precedence: `(expr)`
- Square braces to create lists: `[x1, x2, x3, ...]`
- Curly braces to create namespaces: `{n1:v1, n2=v2, n3:v3, ...}`

The data types defined in swan are:

- Nothing, or empty tuple: `()`
- Boolean: `TRUE`, `FALSE`
- Number: `123.4`
- String: `"abc"`, `'abc'`, `` `abc` ``
- List: `[a, b, c, ...]`
- Namespace: `{n1:v1, n2=v2, n3=v3, ...}`
- Function: `names -> expression`
- Tuple: `x1, x2, x3, ...`

The swan built-in functions are: 
- `bool x`, converts x to boolean
- `enum x`, returns the tuple of the items contained in x
- `error msg`, throws an error
- `filter f x`, filters the items contained in x that match the test function `f`
- `iter f x`, maps the tuple x via the mapping function `f`
- `map f x`, maps the item x via the mapping function `f`
- `not x`, return `FALSE` if `bool x` is true, otherwise `TRUE`
- `range n`, returns the list of numbers between `0` and `n`
- `reduce f x`, reduces the tuple `x` to a single value via the reducer function `f`
- `require x`, loads a standard library module 
- `size x`, returns the number of items in `x`
- `str x`, converts `x` to a string 
- `type x`, returns the type name of `x`


Learn more
--------------------------------------------------------------------------------
- [Introduction to the Swan expression language](./docs/swan.md)
- [Built-in functions](./docs/builtin-functions.md)
- [JavaScript API](./docs/api.md)


License
--------------------------------------------------------------------------------
[MIT](https://opensource.org/licenses/MIT)
