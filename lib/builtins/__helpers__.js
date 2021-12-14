// Internal helpers used by the builtin functions
const types = require("../types");


exports.ensureNumber = function (number) {
    if (typeof number !== "number") throw new TypeError("Numb type expected");
    return number;
}

exports.ensureString = function (string) {
    if (typeof string !== "string") throw new TypeError("Text type expected");
    return string;
}

exports.ensureList = function (list) {
    if (!Array.isArray(list)) throw new TypeError("List type expected");
    return list;
}

exports.ensureNamespace = function (ns) {
    if (types.wrap(ns) instanceof types.Namespace) return ns;
    throw new TypeError("Namespace type exprecte");
}