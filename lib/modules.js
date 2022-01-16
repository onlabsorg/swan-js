const pathlib = require('path');
const types = require("./types");

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
        return module(types);
    } else {
        return module
    }
}

const define = exports.define = function (modulePath, loader) {
    modules[normPath(modulePath)] = loader;
}

define("bool"     , () => import(/* webpackChunkName: "swan_modules/bool" */     "./modules/bool.js"));
define("numb"     , () => import(/* webpackChunkName: "swan_modules/numb" */     "./modules/numb.js"));
define("text"     , () => import(/* webpackChunkName: "swan_modules/text" */     "./modules/text.js"));
define("list"     , () => import(/* webpackChunkName: "swan_modules/list" */     "./modules/list.js"));
define("time"     , () => import(/* webpackChunkName: "swan_modules/time" */     "./modules/time.js"));

define("path"     , () => import(/* webpackChunkName: "swan_modules/path" */     "./modules/path.js"));
define("debug"    , () => import(/* webpackChunkName: "swan_modules/debug" */    "./modules/debug.js"));

