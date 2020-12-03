
exports.find = function (list, item) {
    ensureList(list);
    return list.indexOf(item);
}

exports.rfind = function (list, item) {
    ensureList(list);
    return list.lastIndexOf(item);
}

exports.join = function (list, separator="") {
    ensureList(list);
    for (let item of list) ensureString(item);
    ensureString(separator);
    return list.join(separator);
}

exports.reverse = function (list) {
    ensureList(list);
    const rlist = [];
    for (let i=list.length-1; i>=0; i--) {
        rlist.push(list[i]);
    }
    return rlist;
}

exports.slice = function (list, startIndex, endIndex) {
    ensureList(list);
    ensureNumber(startIndex);
    if (endIndex !== undefined) ensureNumber(endIndex);
    return list.slice(startIndex, endIndex);
}


function ensureList (list) {
    if (!Array.isArray(list)) throw new Error("List type expected");
}

function ensureString (string) {
    if (typeof string !== "string") throw new Error("String type expected");
}

function ensureNumber (number) {
    if (Number.isNaN(number)) throw new Error("Number type expected");
}
