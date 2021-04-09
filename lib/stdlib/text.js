/**
 *  text - swan stdlib module
 *  ============================================================================
 *  This module contains functions to manupulate strings of text.
 */


/**
 *  text.find - function
 *  ----------------------------------------------------------------------------
 *  Returns the index of the first occurrence of a sub-string inside a given
 *  string. It returns -1 if the sub-string is not contained in the given string.
 *  ```
 *  index = text.find(str, subStr)
 *  ```
 */
exports.find = function (str, subStr) {
    ensureString(str);
    ensureString(subStr);
    return str.indexOf(subStr);
}


/**
 *  text.rfind - function
 *  ----------------------------------------------------------------------------
 *  Returns the index of the last occurrence of a sub-string inside a given
 *  string. It returns -1 if the sub-string is not contained in the given string.
 *  ```
 *  index = text.rfind(str, subStr)
 *  ```
 */
exports.rfind = function (str, subStr) {
    ensureString(str);
    ensureString(subStr);
    return str.lastIndexOf(subStr);
}


/**
 *  text.lower - function
 *  ----------------------------------------------------------------------------
 *  Returns the lower-case transformation of a given string.
 *  ```
 *  loStr = text.lower(str)
 *  ```
 */
exports.lower = function (str) {
    ensureString(str);
    return str.toLowerCase();
}



/**
 *  text.upper - function
 *  ----------------------------------------------------------------------------
 *  Returns the upper-case transformation of a given string.
 *  ```
 *  upStr = text.upper(str)
 *  ```
 */
exports.upper = function (str) {
    ensureString(str);
    return str.toUpperCase();
}


/**
 *  text.char - function
 *  ----------------------------------------------------------------------------
 *  Returns a string given the numeric code of its characters.
 *  ```
 *  str = text.char(ch1, ch2, ch3, ...)
 *  ```
 */
exports.char = function (...charCodes) {
    for (let charCode of charCodes) ensureNumber(charCode);
    return String.fromCharCode(...charCodes);
}


/**
 *  text.code - function
 *  ----------------------------------------------------------------------------
 *  Returns the list of the numeric codes of the characters composing a string.
 *  ```
 *  cList = text.code(str)
 *  ```
 */
exports.code = function (str) {
    ensureString(str);
    return Array.from(str).map(c => c.charCodeAt(0));
}


/**
 *  text.slice - function
 *  ----------------------------------------------------------------------------
 *  Given a string, it returns the sub-string between a start index and an end index.
 *  ```
 *  subStr = text.slice(str, startIndex, endIndex)
 *  ```
 *  - The character at the end index is not included in the sub-string
 *  - Negative indexes are assumed to be relative to the end of the sting
 *  - If the end index is missing, it slices up to the and of the string
 */
exports.slice = function (str, firstIndex, lastIndex) {
    ensureString(str);
    ensureNumber(firstIndex);
    if (lastIndex !== undefined) ensureNumber(lastIndex);
    return str.slice(firstIndex, lastIndex);
}


/**
 *  text.split - function
 *  ----------------------------------------------------------------------------
 *  Given a string and a separator, it returns the list of the strings between the
 *  separator.
 *  ```
 *  subStr = text.split(str, separator)
 *  ```
 */
exports.split = function (str, divider) {
    ensureString(str);
    ensureString(divider);
    return str.split(divider);
}



/**
 *  text.replace - function
 *  ----------------------------------------------------------------------------
 *  Given a string `s`, it returns a new string obtained by replacing all the
 *  occurrencies of a `searchStr` with a `replacementStr`.
 *  ```
 *  rStr = text.replace(s, searchStr, replacentStr)
 *  ```
 */
exports.replace = (str, subStr, newSubStr) => {
    ensureString(str);
    ensureString(subStr);
    ensureString(newSubStr);
    while (str.indexOf(subStr) !== -1) {
        str = str.replace(subStr, newSubStr);
    }
    return str;
}


/**
 *  text.trim - function
 *  ----------------------------------------------------------------------------
 *  Given a string `s`, it returns a new string obtained by replacing both the
 *  leading and trailing spaces.
 *  ```
 *  ts = text.trim(s)
 *  ```
 */
exports.trim = (str) => {
    ensureString(str);
    return str.trim();
}


/**
 *  text.trimStart - function
 *  ----------------------------------------------------------------------------
 *  Given a string `s`, it returns a new string obtained by replacing the leading
 *  spaces.
 *  ```
 *  ts = text.trimStart(s)
 *  ```
 */
exports.trimStart = (str) => {
    ensureString(str);
    return str.trimStart();
}


/**
 *  text.trimEnd - function
 *  ----------------------------------------------------------------------------
 *  Given a string `s`, it returns a new string obtained by replacing the trailing
 *  spaces.
 *  ```
 *  ts = text.trimEnd(s)
 *  ```
 */
exports.trimEnd = (str) => {
    ensureString(str);
    return str.trimEnd();
}



function ensureString (string) {
    if (typeof string !== "string") throw new Error("String type expected");
}

function ensureNumber (number) {
    if (Number.isNaN(number)) throw new Error("Number type expected");
}
