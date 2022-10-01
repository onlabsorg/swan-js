module.exports = {

    "math"      : () => import(/* webpackChunkName: "swan_modules/math"      */ "./math.js"),
    "time"      : () => import(/* webpackChunkName: "swan_modules/time"      */ "./time.js"),
    "json"      : () => import(/* webpackChunkName: "swan_modules/json"      */ "./json.js"),
    "debug"     : () => import(/* webpackChunkName: "swan_modules/debug"     */ "./debug.js")
}
