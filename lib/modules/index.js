/**
 *  Swan standard module
 *  ============================================================================
 *  Modules are namespaces that can be loaded at runtime using the `require`
 *  builtin function. The available modules are:
 *  
 *  - [debug](./debug.md) containing function for debugging of swan code
 *  - [dict](./dict.md) containing an implementation of a dictionary type
 *  - [json](./json.md) containing function to parse and stringify JSON data
 *  - [math](./math.md) containing mathematical functions and constants
 *  - [time](./time.md) containing functions for date and time manipulation
 */


module.exports = {

    "debug"     : () => import(/* webpackChunkName: "swan_modules/debug"     */ "./debug.js"),
    "dict"      : () => import(/* webpackChunkName: "swan_modules/dict"      */ "./dict.js"),
    "json"      : () => import(/* webpackChunkName: "swan_modules/json"      */ "./json.js"),
    "list"      : () => import(/* webpackChunkName: "swan_modules/text"      */ "./list.js"),
    "math"      : () => import(/* webpackChunkName: "swan_modules/math"      */ "./math.js"),
    "path"      : () => import(/* webpackChunkName: "swan_modules/path"      */ "./path.js"),
    "text"      : () => import(/* webpackChunkName: "swan_modules/text"      */ "./text.js"),
    "time"      : () => import(/* webpackChunkName: "swan_modules/time"      */ "./time.js"),
}
