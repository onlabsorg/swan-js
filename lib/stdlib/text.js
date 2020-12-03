

exports.find = function (str, subStr) {
    ensureString(str);
    ensureString(subStr);
    return str.indexOf(subStr);
}

exports.rfind = function (str, subStr) {
    ensureString(str);
    ensureString(subStr);
    return str.lastIndexOf(subStr);
}

exports.lower = function (str) {
    ensureString(str);
    return str.toLowerCase();
}

exports.upper = function (str) {
    ensureString(str);    
    return str.toUpperCase();
}

exports.char = function (...charCodes) {
    for (let charCode of charCodes) ensureNumber(charCode);
    return String.fromCharCode(...charCodes);
}
exports.code = function (str) {
    ensureString(str);    
    return Array.from(str).map(c => c.charCodeAt(0));
}

exports.slice = function (str, firstIndex, lastIndex) {
    ensureString(str);
    ensureNumber(firstIndex);
    if (lastIndex !== undefined) ensureNumber(lastIndex);
    return str.slice(firstIndex, lastIndex);
}

exports.split = function (str, divider) {
    ensureString(str);
    ensureString(divider);
    return str.split(divider);
}

exports.replace = (str, subStr, newSubStr) => {
    ensureString(str);
    ensureString(subStr);
    ensureString(newSubStr);
    while (str.indexOf(subStr) !== -1) {
        str = str.replace(subStr, newSubStr);
    }
    return str;
}



function ensureString (string) {
    if (typeof string !== "string") throw new Error("String type expected");
}

function ensureNumber (number) {
    if (Number.isNaN(number)) throw new Error("Number type expected");
}
