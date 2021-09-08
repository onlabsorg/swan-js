const pathlib = require('path');
const interpreter = require('./interpreter');

function normPath (path) {
    return pathlib.normalize(`/${path}`);
}



const modules = {};

async function loadModule (modulePath) {
    const module = await modules[ normPath(modulePath) ]();
    return module.default || module;
}

exports.require = async function (modulePath) {
    const module = await loadModule(modulePath);
    if (typeof module === "function") {
        return module({
            Tuple: interpreter.Tuple,
            Undefined: interpreter.Undefined,
            parse: interpreter.parse,
            context: interpreter.context
        })
    } else {
        return module
    }
}

const define = exports.define = function (modulePath, loader) {
    modules[normPath(modulePath)] = loader;
}

define("date"     , () => import(/* webpackChunkName: "swan_modules/date" */     "./modules/date.js"));
define("dict"     , () => import(/* webpackChunkName: "swan_modules/dict" */     "./modules/dict.js"));
define("http"     , () => import(/* webpackChunkName: "swan_modules/http" */     "./modules/http.js"));
define("json"     , () => import(/* webpackChunkName: "swan_modules/json" */     "./modules/json.js"));
define("list"     , () => import(/* webpackChunkName: "swan_modules/list" */     "./modules/list.js"));
define("math"     , () => import(/* webpackChunkName: "swan_modules/math" */     "./modules/math.js"));
define("path"     , () => import(/* webpackChunkName: "swan_modules/path" */     "./modules/path.js"));
define("text"     , () => import(/* webpackChunkName: "swan_modules/text" */     "./modules/text.js"));
define("debug"    , () => import(/* webpackChunkName: "swan_modules/debug" */    "./modules/debug.js"));

