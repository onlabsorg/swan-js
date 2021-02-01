/**
 *  list - swan stdlib module
 *  ============================================================================
 *  This modules contains functions to manipulate swan lists.
 */


/**
 *  list.find - function
 *  ----------------------------------------------------------------------------
 *  Returns the index of the fists occurrence of an item inside a list. It
 *  returns -1 if the given item is not contained in the list.
 *  ```
 *  index = list.find(lst, item)
 *  ```
 */
exports.find = function (list, item) {
    ensureList(list);
    return list.indexOf(item);
}


/**
 *  list.rfind - function
 *  ----------------------------------------------------------------------------
 *  Returns the index of the last occurrence of an item inside a list. It
 *  returns -1 if the given item is not contained in the list.
 *  ```
 *  index = list.rfind(lst, item)
 *  ```
 */
exports.rfind = function (list, item) {
    ensureList(list);
    return list.lastIndexOf(item);
}


/**
 *  list.join - function
 *  ----------------------------------------------------------------------------
 *  Given a list of strings, returns the string obtained by concatenating
 *  all the item, optionally with an interposed separator.
 *  ```
 *  str = list.join(strList, separator)
 *  ```
 */
exports.join = function (list, separator="") {
    ensureList(list);
    for (let item of list) ensureString(item);
    ensureString(separator);
    return list.join(separator);
}


/**
 *  list.reverse - function
 *  ----------------------------------------------------------------------------
 *  Returns a list containing all the item of a given list, but in reversed
 *  oredr.
 *  ```
 *  rList = list.reverse(lst)
 *  ```
 */
exports.reverse = function (list) {
    ensureList(list);
    const rlist = [];
    for (let i=list.length-1; i>=0; i--) {
        rlist.push(list[i]);
    }
    return rlist;
}


/**
 *  list.slice - function
 *  ----------------------------------------------------------------------------
 *  Returns the portion of a given list, between a startIndex (included) and
 *  an endIndex (not included). Negative indexes are computed from the end
 *  of the list.
 *  ```
 *  subList = list.slice(lst, startIndex, endIndex)
 *  ```
 *  If `endIndex` is omitted, it slices up to the end of `lst`.
 */
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
