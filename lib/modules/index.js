module.exports = {

    "numb"      : () => import(/* webpackChunkName: "swan_modules/numb"      */ "./numb.js"),
    "text"      : () => import(/* webpackChunkName: "swan_modules/text"      */ "./text.js"),
    "list"      : () => import(/* webpackChunkName: "swan_modules/list"      */ "./list.js"),
    
    "time"      : () => import(/* webpackChunkName: "swan_modules/time"      */ "./time.js"),
    "debug"     : () => import(/* webpackChunkName: "swan_modules/debug"     */ "./debug.js")
}
