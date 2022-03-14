SwanJS
================================================================================
SwanJS is an expression language that runs in any JavaScript environment.

```js
swan = require('swan-js');              // load the library
evaluate = swan.parse( "3 * x" );       // compile an expression
context = swan.createContext({x:10});   // create an expression context
value = await evaluate(context);        // evaluate expression in context: 30
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

- Arithmetic operations: `x + y`, `x - y`, `x * y`, `x / y`, `x % y`, `x ** y`
- Comparison operations: `x == y`, `x != y`, `x > y`, `x >= y`, `x < y`, `x <= y`
- Logic operations: `x & y`, `x | y`
- Conditional and alternative operations: `x ? y`, `x ; y`, or combined `x ? y ; z`
- Pairing operation: `x , y`
- Application (function call): `x y`
- Function definition: `x -> y`
- Composition operations: `g << f`, `f >> g`
- Mapping operation: `x => f`
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
- Undefined: `undefined(operationName, operands)`
- Tuple: `x1, x2, x3, ...`

The swan built-in functions are:
- `bool x`, converts a value to boolean
- `dom m`, returns the domain of a Text, List or Namespace item as a tuple
- `not x`, returns `FALSE` if `bool x` is true, otherwise `TRUE`
- `range n`, returns the tuple of integers between 0 and the given parameter (excluded)
- `require id`, loads a standard library module
- `size m`, returns the number of mappings in a Text, List of Namespace item
- `str x`, converts its argument to a string
- `type x`, returns the type name of its argument
- `undefined x`, generates an Undefined item


Learn more
--------------------------------------------------------------------------------
- [Swan expression language guide](./docs/swan.md)
- [Standard library](./docs/modules.md)
- [JavaScript API](./docs/api.md)
- [Swan REPL](./docs/repl.md)


License
--------------------------------------------------------------------------------
[MIT](https://opensource.org/licenses/MIT)


Related projects
--------------------------------------------------------------------------------
- [olojs](https://github.com/onlabsorg/olojs) is a template engine and
  content management system that uses swan as inline expression language
