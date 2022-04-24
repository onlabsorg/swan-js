/**
 *  swan
 *  ============================================================================
 *  The swan JavaScript API include a `parse` function and a `createContext`
 *  function to parse and evaluate expressions. 
 */

const types = exports.types = require("./lib/types");
const parse = require("./lib/interpreter");
const builtins = require("./lib/builtins");


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
 *  
 *  Where:
 *  - `espression` is a string containing any valid swan expression
 *  - `context` is a valid swan expression context
 *  - `value` is the value that expression result has in the given context
 */

exports.parse = function (expression) {
    const evaluate = parse(expression);
    return async (context={}) => {
        const term = await evaluate(context);
        return term.unwrap();
    }
}



/**
 *  swan.createContext - function
 *  ----------------------------------------------------------------------------
 *  Creates a valid expression context.
 *  
 *  ```js
 *  context = swan.createContext(...namespaces)
 *  ```
 *  
 *  Where:
 *  - `namespaces` is a list of objects `ns1, ns2, ns3, ...` that will be merged
 *    to the swan builtin namespace
 *  - `context` is an object containing all the swan builtins, plus
 *    all the properties of the passed namespaces, added in order.
 */
exports.createContext = function (...namespaces) {
    let context = Object.create(builtins);
    for (let namespace of namespaces) {
        context = Object.assign(Object.create(context), namespace);
    }
    return context;
}
