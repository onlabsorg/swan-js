const types = require("./types");


const Undefined = {
    
    create (type, ...args) {
        return new types.Undefined(type, ...args);
    },
    
    type (undef) {
        return ensureUndefined(undef).type;
    },
    
    args (undef) {
        return ensureUndefined(undef).args;
    },
}


const Bool = {
    
    from (value) {
        return types.wrap(value).toBoolean();
    },
    
    not (value) {
        return !ensureBoolean(value);
    },
    
    TRUE: true,
    
    FALSE: false
}


const Numb = {
    
    INFINITY: Infinity,
    
    // Math operations
    
    abs: Math.abs,      // Returns the absolute value of a number.
    max: Math.max,      // Returns the largest of zero or more numbers.
    min: Math.min,      // Returns the smallest of zero or more numbers.
    sqrt: Math.sqrt,    // Returns the positive square root of a number.
    mod: y => x => x%y, // Returns x mod y

    PI: Math.PI,        // Ratio of the a circle's circumference to its diameter, approximately 3.14159.
    cos: Math.cos,      // Returns the cosine of a number.
    sin: Math.sin,      // Returns the sine of a number.
    tan: Math.tan,      // Returns the tangent of a number.
    acos: Math.acos,    // Returns the arccosine of a number.
    asin: Math.asin,    // Returns the arcsine of a number.
    atan: Math.atan,    // Returns the arctangent of a number.
    
    E: Math.E,          // Euler's constant and the base of natural logarithms, approximately 2.718.
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


const Text = {
    
    async from (...values) {
        const term = new types.Tuple(...values);
        const textTuple = await term.imapAsync(async (item) => {
            if (item instanceof types.Namespace) {
                const __text__ = item.apply("__text__");
                if (__text__ instanceof types.Func) {
                    return await __text__.apply(item);
                }
                if (!(__text__ instanceof types.Undefined)) {
                    return __text__;
                }
            }
            return item;
        });
        return textTuple.toString();
    },
    
    size (string) {
        return ensureString(string).length;
    },
    
    from_char_codes (...charCodes) {
        for (let charCode of charCodes) ensureNumber(charCode);
        return String.fromCharCode(...charCodes);
    },
    
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

    find (subStr) {
        ensureString(subStr);
        return str => ensureString(str).indexOf(subStr);
    },

    rfind (subStr) {
        ensureString(subStr);
        return str => ensureString(str).lastIndexOf(subStr);
    },
    
    lower: str => ensureString(str).toLowerCase(),
    
    upper: str => ensureString(str).toUpperCase(),
    
    trim: str => ensureString(str).trim(),

    trim_head: str => ensureString(str).trimStart(),

    trim_tail: str => ensureString(str).trimEnd(),
    
    head (index) {
        ensureNumber(index);
        return str => ensureString(str).slice(0, index);
    },
    
    tail (index) {
         ensureNumber(index);
         return str => ensureString(str).slice(index);
     },

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


const List = {
    
    size (array) {
        return ensureList(array).length;
    },
    
    map: fn => async (array) => {
        const image = [];
        for (let value of ensureList(array)) {
            image.push(await fn(value));
        }
        return image;
    },
    
    find: item => list => ensureList(list).indexOf(item),

    rfind: item => list => ensureList(list).lastIndexOf(item),
    
    join (separator) {
        ensureString(separator);
        return list => {
            ensureList(list);
            for (let item of list) ensureString(item);
            return list.join(separator);            
        }
    },
    
    reverse (list) {
        ensureList(list);
        const rlist = [];
        for (let i=list.length-1; i>=0; i--) {
            rlist.push(list[i]);
        }
        return rlist;
    },
    
    head (index) {
        ensureNumber(index);
        return list => ensureList(list).slice(0, index);
    },
    
    tail (index) {
        ensureNumber(index);
        return list => ensureList(list).slice(index);
    },
}


const Namespace = {
    
    size (object) {
        return new types.Namespace( ensureNamespace(object) ).size;
    },
    
    map: fn => async object => {
        const namespace = new types.Namespace(ensureNamespace(object));
        const image = {};
        for (let key of namespace.domain) {
            image[key] = await fn(namespace.f(key));
        }
        return image;
    }
}


const Func = {
    
    compose (...funcs) {
        return this.pipe(...funcs.reverse());
    },
    
    pipe (...funcs) {
        const funcTuple = new types.Tuple(...funcs);
        return async (...args) => {
            let res = new types.Tuple(...args);
            for (let funcItem of funcTuple.items()) {
                res = await funcItem.apply(...res);
            }
            return res.unwrap();
        }
    }
}


const Tuple = {
    
    from (value) {
        const item = types.wrap(value);
        switch (item.typeName) {
            
            case "Text": 
            case "List":
                return new types.Tuple(...value).unwrap();
                
            case "Namespace":
                return new types.Tuple(...item.domain.sort()).unwrap();
                
            default:
                return null;
        }
    },
    
    map: fn => async (...values) => {
        const image = await List.map(fn)(values);
        return new types.Tuple(...image).unwrap();
    },
}


const Time = {
    
    /**
     *  Time.now() : () => Numbe
     *  ------------------------------------------------------------------------
     *  It returns the current epoch time in seconds.
     *  
     *  ```
     *  ctime = Time.now()
     *  ```
     */
    now () {
        return Date.now() / 1000;
    },


    /**
     *  Time.timezone() : () -> Numb
     *  ------------------------------------------------------------------------
     *  It returns the current UTC time zone in hours. For example in UTC+1 it
     *  will return +1.
     */
    timezone () {
        const date = new Date();
        return -date.getTimezoneOffset() / 60;
    },
    
    
    /**
     *  Time.to_date : Numb -> Namespace
     *  ------------------------------------------------------------------------
     *  Given an epoch time expressed in seconds, it returns a `date` Namespace 
     *  containg the following local date information:
     *  
     *  - `date.year` : Numb
     *  - `date.month` : Numb between 1 (January) and 12 (December)
     *  - `date.day` : Numb between 1 and 31
     *  - `date.hours` : Numb between 0 and 23
     *  - `date.minutes` : Numb between 0 and 59
     *  - `date.seconds` : Numb between 0.000 and 59.999
     */
    to_date (time) {
        const date = new Date(ensureNumber(time*1000));
        return {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hours: date.getHours(),
            minutes: date.getMinutes(),
            seconds: date.getSeconds() + date.getMilliseconds() / 1000,
        }
    },

    
    /**
     *  Time.to_UTC_date : Numb -> Namespace
     *  ------------------------------------------------------------------------
     *  Given an epoch time expressed in seconds, it returns a `date` Namespace 
     *  containg the following UTC date information:
     *  
     *  - `date.year` : Numb
     *  - `date.month` : Numb between 1 (January) and 12 (December)
     *  - `date.day` : Numb between 1 and 31
     *  - `date.hours` : Numb between 0 and 23
     *  - `date.minutes` : Numb between 0 and 59
     *  - `date.seconds` : Numb between 0.000 and 59.999
     */
    to_UTC_date (time) {
        const date = new Date(ensureNumber(time*1000));
        return {
            year: date.getUTCFullYear(),
            month: date.getUTCMonth() + 1,
            day: date.getUTCDate(),
            hours: date.getUTCHours(),
            minutes: date.getUTCMinutes(),
            seconds: date.getUTCSeconds() + date.getUTCMilliseconds() / 1000,
        }
    },
    

    /**
     *  Time.from_date : Namespace -> Numb
     *  ------------------------------------------------------------------------
     *  Given a local date namespace, it returns the correspondign epoch time 
     *  expressed in seconds.
     */
    from_date (date) {
        ensureNamespace(date);
        const seconds = date.seconds ? Math.trunc(date.seconds) : 0;
        const milliseconds = Math.round((date.seconds - seconds) * 1000);
        return Number(new Date(
            date.year || 0,
            (date.month || 1) - 1,
            date.day || 1,
            date.hours || 0,
            date.minutes || 0,
            seconds,
            milliseconds
        )) / 1000;
    },

    
    /**
     *  Time.from_UTC_date : Namespace -> Numb
     *  ------------------------------------------------------------------------
     *  Given an UTC date namespace, it returns the correspondign epoch time 
     *  expressed in seconds.
     */
    from_UTC_date (date) {
        ensureNamespace(date);
        const seconds = date.seconds ? Math.trunc(date.seconds) : 0;
        const milliseconds = Math.round((date.seconds - seconds) * 1000);
        return Number(Date.UTC(
            date.year || 0,
            (date.month || 1) - 1,
            date.day || 1,
            date.hours || 0,
            date.minutes || 0,
            seconds,
            milliseconds
        )) / 1000;
    },


    /**
     *  Time.to_ISO_string : Numb -> Text
     *  ------------------------------------------------------------------------
     *  Given an epoch time in seconds, it returns its ISO string representation.
     *  For example:
     *  
     *  ```
     *  time = Time.to_ISO_string(1639513675.900)
     *  // returns "2021-12-14T20:27:55.900Z"
     *  ```
     */
    to_ISO_string (time) {
        const date = new Date(ensureNumber(time)*1000);
        return date.toISOString();
    },
    

    /**
     *  Time.from_string : Text -> Numb
     *  ------------------------------------------------------------------------
     *  Returns an epoch time in seconds given a date string representation.
     *  For example:
     *  
     *  ```
     *  time = Time.from_string("2021-12-14T20:27:55.900Z")   
     *  // returns 1639513675.900 s
     *  ```
     */
    from_string (str) {
        ensureString(str);
        return Number( Date.parse(str) ) / 1000;
    },
    

    /**
     *  Time.week_day(time) : Numb -> Numb
     *  ------------------------------------------------------------------------
     *  Given an epoch time, it returns the day of the week of the corresponding, 
     *  date in the loacal timezone. Sunday is 0, monday is 1, tuesday is 2, etc.
     *  For example:
     *  
     *  ```
     *  Time.week_day(1639513675.900)   // returns 2 for Tuesday
     *  ```
     */
    week_day (time) {
        const date = new Date(ensureNumber(time)*1000);
        return date.getDay();
    },
    

    /**
     *  Time.week_number(time) : Numb -> Numb
     *  ------------------------------------------------------------------------
     *  Given an epoch time, it returns the week number of the corresponding, 
     *  date in the loacal timezone. For example:
     *  
     *  ```
     *  Time.week_number(1639513675.900)   // returns 50
     *  ```
     */
    week_number (time) {
        const date = new Date(ensureNumber(time)*1000);
        date.setHours(0, 0, 0, 0);
        // Thursday in current week decides the year.
        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
        // January 4 is always in week 1.
        var week1 = new Date(date.getFullYear(), 0, 4);
        // Adjust to Thursday in week 1 and count number of weeks from date to week1.
        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);        
    },
}


module.exports = {
    Undefined,
    Bool,
    Numb,
    Text,
    Func,
    List,
    Namespace,
    Tuple,
    Time
}



// -----------------------------------------------------------------------------
//  Helper Functions
// -----------------------------------------------------------------------------

function ensureBoolean (bool) {
    if (types.wrap(bool) instanceof types.Bool) return bool;
    throw new TypeError("Bool type expected");
}

function ensureNumber (number) {
    if (typeof number !== "number") throw new TypeError("Numb type expected");
    return number;
}

function ensureString (string) {
    if (typeof string !== "string") throw new TypeError("Text type expected");
    return string;
}

function ensureList (list) {
    if (!Array.isArray(list)) throw new TypeError("List type expected");
    return list;
}

function ensureNamespace (ns) {
    if (types.wrap(ns) instanceof types.Namespace) return ns;
    throw new TypeError("Namespace type expected");
}

function ensureUndefined (undef) {
    if (undef instanceof types.Undefined) return undef;
    throw new TypeError("Undefined type expected");
}
