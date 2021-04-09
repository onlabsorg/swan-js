/**
 *  swan
 *  ============================================================================
 *  The swan JavaScript API include a `parse` function and a `createContext`
 *  function to parse and evaluate expressions. 
 *  Furthermore, it contains a `defineModule` to add custom javascript modules 
 *  to the swan standard library and the types `Tuple` and `Undefined` which
 *  are the only two swan types that do not correspond to a javascript negative
 *  type.
 */
 
const {Tuple, Undefined, parse, context} = require('./lib/interpreter');
const modules = require('./lib/modules');
context.require = modules.require;



/**
 *  swan.parse - function
 *  ----------------------------------------------------------------------------
 *  Parses a swan expression and returns a function that maps a context to an
 *  expression value.
 *  
 *  ```js
 *  evaluate = swan.parse(expression);
 *  value = await evaluate(context);
 *  ```
 *  - `espression` is a string containing any valid swan expression
 *  - `context` is a valid swan expression context
 *  - `value` is the value that expression result has in the given context
 */

exports.parse = function (expression) {
    const evaluate = parse(expression);
    return async (ctx) => {
        if (!context.isPrototypeOf(ctx)) {
            throw new Error("Invalid context!");
        }
        const value = await evaluate(ctx);
        return Tuple(value).normalize();
    }
}



/**
 *  swan.createContext - function
 *  ----------------------------------------------------------------------------
 *  Creates a valid expression context.
 *  ```js
 *  context = swan.createContext(...namespaces)
 *  ```
 *  - `namespaces` is a list of objects `ns1, ns2, ns3, ...` that will be merged
 *    to the core swan context
 *  - `context` is an object containing all the core context properties, plus
 *    all the properties of the passed namespace, added in order.
 */
exports.createContext = function (...namespaces) {
    
    if (namespaces.length === 0) {
        return context.$extend({});
    }
    
    let ctx = context;
    for (let namespace of namespaces) {
        ctx = ctx.$extend(namespace);
    }
    return ctx;
}



/**
 *  swan.defineModule - function
 *  ----------------------------------------------------------------------------
 *  Adds a module to the swan library. The module can be then loaded with
 *  the built-in `require` function.
 *  ```js
 *  swan.defineModule(modulePath, moduleLoader)
 *  ```
 *  - `modulePath` a `/-separated` path that identifies the module
 *  - `moduleLoader` an asynchronous function that returns the module
 */
exports.defineModule = modules.define;



/**
 *  swan.Tuple - function
 *  ----------------------------------------------------------------------------
 *  This function creates a swan tuple object.
 *  ```js
 *  tuple = Tuple(item1, item2, ...)
 *  tuple instanceof Tuple      // true
 *  ```
 */
exports.Tuple = Tuple;



/**
 *  swan.Undefined - function
 *  ----------------------------------------------------------------------------
 *  This function creates a swan undefined object.
 *  ```js
 *  undef = Undefined(...args)
 *  undef instanceof Undefined      // true
 *  ```
 */
exports.Undefined = function (...args) {
    return new Undefined(...args);
}
exports.Undefined.prototype = Undefined.prototype;
