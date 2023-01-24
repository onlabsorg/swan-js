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
parentheses (...), square braces [...] or curly braces {...}.

The available binary operations are:

- Arithmetic operations: `x + y`, `x - y`, `x * y`, `x / y`, `x % y`, `x ^ y`
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

- Parentheses to alter evaluation precedence: `(expr)`
- Square braces to create lists: `[x1, x2, x3, ...]`
- Curly braces to create namespaces: `{n1:v1, n2=v2, n3:v3, ...}`

The data types defined in swan are:

- Nothing, or empty tuple: `()`
- Bool: `TRUE`, `FALSE`
- Numb: `123.4`
- Text: `"abc"`, `'abc'`, `` `abc` ``
- List: `[a, b, c, ...]`
- Namespace: `{n1:v1, n2=v2, n3=v3, ...}`
- Func: `names -> expression`
- Undefined: `undefined(operationName, operands)`
- Tuple: `x1, x2, x3, ...`

Besides these operations, Swan defines also some essential [builtins](./docs/builtins.md),
consisting in functions constants.


Learn more
--------------------------------------------------------------------------------
- [Swan expression language guide](./docs/swan.md)
- [Swan standard modules](./docs/modules/index.md)
- [JavaScript API](./docs/api.md)
- [Swan REPL](./docs/repl.md)


License
--------------------------------------------------------------------------------
[MIT](https://opensource.org/licenses/MIT)


Related projects
--------------------------------------------------------------------------------
- [olojs](https://github.com/onlabsorg/olojs) is a template engine and
  content management system that uses swan as inline expression language
