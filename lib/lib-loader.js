const pathlib = require('path');

const modules = {};

exports.require = async function (modulePath) {
    const module = await modules[normPath(modulePath)]();
    return module.default || module;
}

const define = exports.define = function (modulePath, load) {
    modules[normPath(modulePath)] = load;
}

define("math"     , () => import(/* webpackChunkName: "/stdlib/math" */     "./stdlib/math.js"));
define("markdown" , () => import(/* webpackChunkName: "/stdlib/markdown" */ "./stdlib/markdown.js"));
define("path"     , () => import(/* webpackChunkName: "/stdlib/path" */     "./stdlib/path.js"));
define("json"     , () => import(/* webpackChunkName: "/stdlib/json" */     "./stdlib/json.js"));
define("text"     , () => import(/* webpackChunkName: "/stdlib/text" */     "./stdlib/text.js"));
define("list"     , () => import(/* webpackChunkName: "/stdlib/list" */     "./stdlib/list.js"));
define("http"     , () => import(/* webpackChunkName: "/stdlib/list" */     "./stdlib/http.js"));

function normPath (path) {
    return pathlib.normalize(`/${path}`);
}
