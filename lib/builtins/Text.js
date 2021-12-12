const types = require("../types");
const {ensureString, ensureNumber} = require("./__helpers__");

const Text = module.exports = {
    
    from (value) {
        return wrap(value).toString();
    },
    
    /**
     *  Text.from_char_codes - function
     *  ----------------------------------------------------------------------------
     *  Returns a string given the numeric code of its characters.
     *  
     *  ```
     *  str = Text.from_char_codes(ch1, ch2, ch3, ...)
     *  ```
     */
    from_char_codes (...charCodes) {
        for (let charCode of charCodes) ensureNumber(charCode);
        return String.fromCharCode(...charCodes);
    },
    
    /**
     *  Text.toCharCode - function
     *  ------------------------------------------------------------------------
     *  Given a string, it returns an iterator yielding the code of each 
     *  character. For example:
     *  
     *  ```
     *  Text.toCharCode("abc")    // returns (97, 98, 99)
     *  ```
     */
    to_char_codes  (str) {
        ensureString(str);
        return {
            *[Symbol.iterator] () {
                for (let i=0; i<str.length; i++) {
                    yield str.charCodeAt(i);
                }
            }
        }
    },

    
    /**
     *  Text.find - function
     *  ------------------------------------------------------------------------
     *  Given a sub-string, this function returns a function that takes a
     *  string as argument and returns the first occurrence of the sub-string 
     *  inside the string, or -1 if the sub-string is not contained in the given 
     *  string.
     *
     *  ```
     *  index = Text.find(subStr)(str)
     *  ```
     */
    find (subStr) {
        ensureString(subStr);
        return str => ensureString(str).indexOf(subStr);
    },

    /**
     *  Text.rfind - function
     *  ------------------------------------------------------------------------
     *  Given a sub-string, this function returns a function that takes a
     *  string as argument and returns the last occurrence of the sub-string 
     *  inside the string, or -1 if the sub-string is not contained in the given 
     *  string.
     *
     *  ```
     *  index = Text.rfind(subStr)(str)
     *  ```
     */
    rfind (subStr) {
        ensureString(subStr);
        return str => ensureString(str).lastIndexOf(subStr);
    },
    
    /**
     *  Text.lower - function
     *  ----------------------------------------------------------------------------
     *  Returns the lower-case transformation of a given string.
     *  ```
     *  loStr = Text.lower(str)
     *  ```
     */
    lower: str => ensureString(str).toLowerCase(),
    
    /**
     *  Text.upper - function
     *  ----------------------------------------------------------------------------
     *  Returns the upper-case transformation of a given string.
     *  
     *  ```
     *  upStr = Text.upper(str)
     *  ```
     */
    upper: str => ensureString(str).toUpperCase(),
    
    /**
     *  Text.trim - function
     *  ----------------------------------------------------------------------------
     *  Given a string `str`, it returns a new string obtained by removing both 
     *  the leading and trailing spaces.
     *  
     *  ```
     *  ts = Text.trim(str)
     *  ```
     */
    trim: str => ensureString(str).trim(),

    /**
     *  text.trim_head - function
     *  ----------------------------------------------------------------------------
     *  Given a string `str`, it returns a new string obtained by removing the
     *  leadingspaces.
     *  
     *  ```
     *  ts = Text.trim_head(str)
     *  ```
     */
    trim_head: str => ensureString(str).trimStart(),

    /**
     *  text.trim_tail - function
     *  ----------------------------------------------------------------------------
     *  Given a string `str`, it returns a new string obtained by removing the
     *  trailing spaces.
     *  ```
     *  
     *  ts = Text.trim_tail(str)
     *  ```
     */
    trim_tail: str => ensureString(str).trimEnd(),
    
    /**
     *  Text.head - function
     *  ------------------------------------------------------------------------
     *  Gives an index `i` it returns a function that takes a string `str`
     *  and returns a substring made of its firs i characters. For example: 
     *  
     *  ```js
     *  Text.head(3)("Abcdefghi")  // return "Abc"
     *  ```
     *  
     *  A negative index is interpreted as relative to the end of the string.
     */
    head (index) {
        ensureNumber(index);
        return str => ensureString(str).slice(0, index);
    },
    
    /**
     *  Text.tail - function
     *  ------------------------------------------------------------------------
     *  Gives an index `i` it returns a function that takes a string `str`
     *  and returns a substring made of all the characters after the index. 
     *  For example: 
     *  
     *  ```js
     *  Text.head(3)("Abcdefghi")  // return "defghi"
     *  ```
     *  
     *  A negative index is interpreted as relative to the end of the string.
     */
    tail (index) {
         ensureNumber(index);
         return str => ensureString(str).slice(index);
     },

    /**
     *  Text.split - function
     *  ------------------------------------------------------------------------
     *  Gives a separator `sep` it returns a function that takes a string `str`
     *  and returns an iterator that yields the sub-string between the separator. 
     *  For example:
     *  
     *  ```js
     *  Text.split(",")("abc,def,ghi")  // yields "abc", "def", "ghi"
     *  ```
     */
    split (divider) {
        ensureString(divider);
        return str => {
            ensureString(str);
            return {
                *[Symbol.iterator] () {
                    for (let subStr of str.split(divider)) {
                        yield subStr;
                    }
                }
            }
        }
    }
}



