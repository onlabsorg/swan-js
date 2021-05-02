const pathlib = require('path');

function normPath (path) {
    return pathlib.normalize(`/${path}`);
}



const modules = {};

exports.require = async function (modulePath) {
    const module = await modules[normPath(modulePath)]();
    return module.default || module;
}

const define = exports.define = function (modulePath, load) {
    modules[normPath(modulePath)] = load;
}

define("date"     , () => import(/* webpackChunkName: "/swan_modules/date" */     "./modules/date.js"));
define("http"     , () => import(/* webpackChunkName: "/swan_modules/http" */     "./modules/http.js"));
define("json"     , () => import(/* webpackChunkName: "/swan_modules/json" */     "./modules/json.js"));
define("list"     , () => import(/* webpackChunkName: "/swan_modules/list" */     "./modules/list.js"));
define("math"     , () => import(/* webpackChunkName: "/swan_modules/math" */     "./modules/math.js"));
define("path"     , () => import(/* webpackChunkName: "/swan_modules/path" */     "./modules/path.js"));
define("text"     , () => import(/* webpackChunkName: "/swan_modules/text" */     "./modules/text.js"));

