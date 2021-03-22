/**
 *  swan
 *  ============================================================================
 *  The swan JavaScript API include a `parse` function and a `createContext`
 *  function. The parse function compiles an expression string to a function that
 *  takes a context (created with `createdContext`) and asynchronously returns
 *  the expression value.
 *
 *  Example:
 *  ```js
 *  evaluate = swan.parse( "3 * x" );
 *  context = swan.createContext({x:10});
 *  value = await evaluate(context);         // 30
 *  ```
 */
 
const {Tuple, Failure, parse, context} = require('./lib/interpreter');

exports.Tuple = Tuple;
exports.Failure = Failure;

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



// -----------------------------------------------------------------------------
//  MODULES
// -----------------------------------------------------------------------------

const modules = require('./lib/modules');

context.require = modules.require;

exports.defineModule = modules.define;

