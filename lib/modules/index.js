module.exports = {

    "numb"      : () => import(/* webpackChunkName: "swan_modules/numb"      */ "./numb.js"),
    "bool"      : () => import(/* webpackChunkName: "swan_modules/bool"      */ "./bool.js"),
    "text"      : () => import(/* webpackChunkName: "swan_modules/text"      */ "./text.js"),
    "list"      : () => import(/* webpackChunkName: "swan_modules/list"      */ "./list.js"),
    "namespace" : () => import(/* webpackChunkName: "swan_modules/namespace" */ "./namespace.js"),
    
    "time"      : () => import(/* webpackChunkName: "swan_modules/time"      */ "./time.js"),
    "debug"     : () => import(/* webpackChunkName: "swan_modules/debug"     */ "./debug.js")
}
