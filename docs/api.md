swan
============================================================================
This is the main swan module; it contains functions for parsing and 
evaluation swan expressions.

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
evaluate = olojs.expression.parse(expression);
value = await evaluate(context);
```

- `espression` is a string containing any valid swan expression
- `context` is a valid swan expression context
- `value` is the value that expression result has in the given context
  
swan.createContext - function
----------------------------------------------------------------------------
Creates a valid expression context.

```js
context = olojs.expression.createContext(...namespaces)
```

- `namespaces` is a list of objects `ns1, ns2, ns3, ...` that will be merged
  to the core swan context 
- `context` is an object containing all the core context properties, plus 
  all the properties of the passed namespace, added in order.
  
Internals
----------------------------------------------------------------------------
- `swan.types` is an object containing types-realted functions.
- `swan.functions` is an object exposing to JavaScript the swan built-in functions
- `swan.operations` is an object exposing to JavaScript the swan binary operations
  

