swan
============================================================================
The swan JavaScript API include a `parse` function and a `createContext`
function. The parse function compiles an expression string to a function that
takes a context (created with `createdContext`) and asynchronously returns
the expression value.
Example:
```js
evaluate = swan.parse( "3 * x" );
context = swan.createContext({x:10});
value = await evaluate(context);         // 30
```
  
swan.parse - function
----------------------------------------------------------------------------
Parses a swan expression and returns a function that maps a context to an
expression value.
```js
evaluate = swan.parse(expression);
value = await evaluate(context);
```
- `espression` is a string containing any valid swan expression
- `context` is a valid swan expression context
- `value` is the value that expression result has in the given context
  
swan.createContext - function
----------------------------------------------------------------------------
Creates a valid expression context.
```js
context = swan.createContext(...namespaces)
```
- `namespaces` is a list of objects `ns1, ns2, ns3, ...` that will be merged
  to the core swan context
- `context` is an object containing all the core context properties, plus
  all the properties of the passed namespace, added in order.
  
swan.defineModule - function
----------------------------------------------------------------------------
Adds a module to the swan library. The module can be then loaded with
the built-in `require` function.
```js
context = swan.defineModule(modulePath, moduleLoader)
```
- `modulePath` a `/-separated` path that identifies the module
- `moduleLoader` an asynchronous function that returns the module
  
Internals
----------------------------------------------------------------------------
- `swan.T` is an object containing types-realted functions.
- `swan.F` is an object exposing to JavaScript the swan built-in functions
- `swan.O` is an object exposing to JavaScript the swan binary operations
  

