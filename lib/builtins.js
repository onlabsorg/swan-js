const types = require("./types");

const ctx = module.exports = {};


ctx.Bool = {
    
    from (value) {
        return wrap(value).toBoolean();
    }
}


ctx.Numb = {
    
    
    // Math operations
    
    abs: Math.abs,      // Returns the absolute value of a number.
    max: Math.max,      // Returns the largest of zero or more numbers.
    min: Math.min,      // Returns the smallest of zero or more numbers.
    sqrt: Math.sqrt,    // Returns the positive square root of a number.

    pi: Math.PI,        // Ratio of the a circle's circumference to its diameter, approximately 3.14159.
    cos: Math.cos,      // Returns the cosine of a number.
    sin: Math.sin,      // Returns the sine of a number.
    tan: Math.tan,      // Returns the tangent of a number.
    acos: Math.acos,    // Returns the arccosine of a number.
    asin: Math.asin,    // Returns the arcsine of a number.
    atan: Math.atan,    // Returns the arctangent of a number.
    
    e: Math.E,          // Euler's constant and the base of natural logarithms, approximately 2.718.
    exp: Math.exp,      // Returns E^x, where x is the argument, and E is Euler's constant
    log: Math.log,      // Returns the natural logarithm of a number.
    log10: Math.log10,  // Returns the base 10 logarithm of a number.
    
    tanh: Math.tanh,    // Returns the hyperbolic tangent of a number.
    cosh: Math.cosh,    // Returns the hyperbolic cosine of a number.
    sinh: Math.sinh,    // Returns the hyperbolic sine of a number.
    acosh: Math.acosh,  // Returns the hyperbolic arccosine of a number.
    asinh: Math.asinh,  // Returns the hyperbolic arcsine of a number.
    atanh: Math.atanh,  // Returns the hyperbolic arctangent of a number.
    
    ceil: Math.ceil,    // Returns the smallest integer greater than or equal to a number.
    floor: Math.floor,  // Returns the largest integer less than or equal to a number.
    trunc: Math.trunc,  // Returns the integer part of the number x, removing any fractional digits.
    round: Math.round,  // Returns the value of a number rounded to the nearest integer.
    
    random: x => Math.random()*x,   // Returns a pseudo-random number between 0 and x.

    hex: s => Number(`0x${s}`), // Returns a number given its hexadecimal string representation.
    oct: s => Number(`0o${s}`), // Returns a number given its octal string representation.
    bin: s => Number(`0b${s}`), // Returns a number given its binary string representation.
}


ctx.Func = {}


ctx.Undefined = {}


ctx.Text = {
    
    from (value) {
        return wrap(value).toString();
    },
    
    /**
     *  Text.fromCharCodes - function
     *  ----------------------------------------------------------------------------
     *  Returns a string given the numeric code of its characters.
     *  
     *  ```
     *  str = Text.fromCharCodes(ch1, ch2, ch3, ...)
     *  ```
     */
    fromCharCodes (...charCodes) {
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
    toCharCodes (str) {
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
        return str => {
            ensureString(str);            
            return str.indexOf(subStr);
        }
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
        return str => {
            ensureString(str);            
            return str.lastIndexOf(subStr);
        }
    },
    
    /**
     *  Text.lower - function
     *  ----------------------------------------------------------------------------
     *  Returns the lower-case transformation of a given string.
     *  ```
     *  loStr = Text.lower(str)
     *  ```
     */
    lower (str) {
        ensureString(str);
        return str.toLowerCase();
    },
    
    /**
     *  Text.upper - function
     *  ----------------------------------------------------------------------------
     *  Returns the upper-case transformation of a given string.
     *  
     *  ```
     *  upStr = Text.upper(str)
     *  ```
     */
    upper (str) {
        ensureString(str);
        return str.toUpperCase();
    },
    
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
    trim (str) {
        ensureString(str);
        return str.trim();
    },

    /**
     *  text.trimHead - function
     *  ----------------------------------------------------------------------------
     *  Given a string `str`, it returns a new string obtained by removing the
     *  leadingspaces.
     *  
     *  ```
     *  ts = Text.trimHead(str)
     *  ```
     */
    trimHead (str) {
        ensureString(str);
        return str.trimStart();
    },

    /**
     *  text.trimTail - function
     *  ----------------------------------------------------------------------------
     *  Given a string `str`, it returns a new string obtained by removing the
     *  trailing spaces.
     *  ```
     *  
     *  ts = Text.trimTail(str)
     *  ```
     */
    trimTail (str) {
        ensureString(str);
        return str.trimEnd();
    },
    
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
        return str => {
            ensureString(str);
            return str.slice(0, index);
        }
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
         return str => {
             ensureString(str);
             return str.slice(index);
         }
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


ctx.List = {}


ctx.Namespace = {}


ctx.Tuple = {}





// -----------------------------------------------------------------------------
//
//  HELPER FUNCTIONS
//
// -----------------------------------------------------------------------------

function ensureString (string) {
    if (typeof string !== "string") throw new TypeError("Text type expected");
}

function ensureNumber (number) {
    if (typeof number !== "number") throw new TypeError("Numb type expected");
}



