/**
 *  Swan standard module
 *  ============================================================================
 *  Modules are namespaces that can be loaded at runtime using the `require`
 *  builtin function. The available modules are:
 *  
 *  - [math](./math.md) containing mathematical functions and constants
 *  - [time](./time.md) containing functions for date and time manipulation
 *  - [json](./json.md) containing function to parse and stringify JSON data
 *  - [debug](./debug.md) containing function for debugging of swan code
 */


module.exports = {

    "math"      : () => import(/* webpackChunkName: "swan_modules/math"      */ "./math.js"),
    "time"      : () => import(/* webpackChunkName: "swan_modules/time"      */ "./time.js"),
    "json"      : () => import(/* webpackChunkName: "swan_modules/json"      */ "./json.js"),
    "debug"     : () => import(/* webpackChunkName: "swan_modules/debug"     */ "./debug.js")
}
