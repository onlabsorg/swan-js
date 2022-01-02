/**
 *  Swan Builtins
 *  ============================================================================
 *  
 *  The swan builtins is a collection of functions and constants that are
 *  always present in a swan context.
 *  
 *  The builtins are grouped in nine namespace: `Bool`, `Numb`, `Text`, `List`,
 *  `Namespace`, `Func`, `Undefined`, `Tuple` and `Time`.
 */

const types = require("./types");


const MapUU = fn => (...values) => new types.Tuple(...values.map(fn)).unwrap();


/**
 *  Bool builtin namespace
 *  ----------------------------------------------------------------------------
 *  
 *  This namespace contains functions and constants that concern the swan Bool
 *  data type.
 */
const Bool = {


    /**
     *  ### Bool.TRUE constant
     *  This constant represent the boolean true value in swan.
     */
    TRUE: true,
    
    
    /**
     *  ### Bool.FALSE constant
     *  This constant represent the boolean false value in swan.
     */
    FALSE: false,

    
    /**
     *  ### Bool.from function
     *  
     *  Given a swan term X, the `Bool.from` function returns TRUE if the
     *  term is truty, otherwise it returns FALSE.
     *  
     *  Falsy elements are: `FALSE`, `0`, `""`, `[]`, `{}`, `()`, an any 
     *  Undefined item and any tuple containing only falsy elements.
     *  
     *  Any other term is truty.
     */
    from (...values) {
        return new types.Tuple(...values).toBoolean();
    },

    
    /**
     *  ### Bool.from function
     *  
     *  Given a swan term X, the `Bool.not` function returns FALSE if the
     *  term is truty, otherwise it returns TRUE.
     *  
     *  For the definition of truty and falsy terms, see `Bool.from`.
     */
    not (...values) {
        return !Bool.from(...values);
    }
}


/**
 *  Numb builtin namespace
 *  ----------------------------------------------------------------------------
 *  
 *  This namespace contains functions and constants that concern the swan Numb
 *  data type.
 */
const Numb = {
    
    /**
     *  ### Math constants
     *  The following constants are defined:
     *  
     *  - `Numb.INFINITY`: Infinity.
     *  - `Numb.PI`: Ratio of the a circle's circumference to its diameter, approximately 3.14159.
     *  - `Numb.E`: Euler's constant and the base of natural logarithms, approximately 2.718.
     */
    INFINITY: Infinity,
    PI: Math.PI,
    E: Math.E,

    /**
     *  ### Numb.from - function
     *  Converts a string to a number. It accepts also binary (0b...), octal
     *  (0o...) and exadecimal (0x...) string representations of numbers.
     *  
     *  If the argument is not a valid string, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    from: MapUU(s => isString(s) ? Number(s) : NaN),
    
    
    /**
     *  ### Trigonometric functions
     *  The Numb namespace contains the following trigonometric functions: 
     *  
     *  - `Numb.cos`:  Returns the cosine of a number.
     *  - `Numb.sin`:  Returns the sine of a number.
     *  - `Numb.tan`:  Returns the tangent of a number.
     *  - `Numb.acos`: Returns the arccosine of a number.
     *  - `Numb.asin`: Returns the arcsine of a number.
     *  - `Numb.atan`: Returns the arctangent of a number.
     *  
     *  If the argument is not a number, these functions return Undefined Number.
     *  If the parameter is a tuple, these functions apply to each item of the
     *  tuple and return a tuple.
     */
    cos:  MapUU(x => isNumber(x) ? Math.cos(x)  : NaN),  
    sin:  MapUU(x => isNumber(x) ? Math.sin(x)  : NaN),  
    tan:  MapUU(x => isNumber(x) ? Math.tan(x)  : NaN),  
    acos: MapUU(x => isNumber(x) ? Math.acos(x) : NaN),
    asin: MapUU(x => isNumber(x) ? Math.asin(x) : NaN),
    atan: MapUU(x => isNumber(x) ? Math.atan(x) : NaN),

    
    /**
     *  ### Hyperbolic functions
     *  The Numb namespace contains the following hyperbolic functions: 
     *  
     *  - `Numb.cosh`:  Returns the hyperbolic cosine of a number.
     *  - `Numb.sinh`:  Returns the hyperbolic sine of a number.
     *  - `Numb.tanh`:  Returns the hyperbolic tangent of a number.
     *  - `Numb.acosh`: Returns the hyperbolic arccosine of a number.
     *  - `Numb.asinh`: Returns the hyperbolic arcsine of a number.
     *  - `Numb.atanh`: Returns the hyperbolic arctangent of a number.
     *  
     *  If the argument is not a number, these functions return Undefined Number.
     *  If the parameter is a tuple, these functions apply to each item of the
     *  tuple and return a tuple.
     */
    cosh:  MapUU(x => isNumber(x) ? Math.cosh(x)  : NaN),  
    sinh:  MapUU(x => isNumber(x) ? Math.sinh(x)  : NaN),  
    tanh:  MapUU(x => isNumber(x) ? Math.tanh(x)  : NaN),  
    acosh: MapUU(x => isNumber(x) ? Math.acosh(x) : NaN),
    asinh: MapUU(x => isNumber(x) ? Math.asinh(x) : NaN),
    atanh: MapUU(x => isNumber(x) ? Math.atanh(x) : NaN),
    
    
    /**
     *  ### Rounding
     *  The following functions perform number rounding. 
     *  
     *  - `Math.ceil`: Returns the smallest integer greater than or equal to a number.
     *  - `Math.floor`: Returns the largest integer less than or equal to a number.
     *  - `Math.trunc`: Returns the integer part of the number x, removing any fractional digits.
     *  - `Math.round`: Returns the value of a number rounded to the nearest integer.
     *  
     *  If the argument is not a number, these functions return Undefined Number.
     *  If the parameter is a tuple, these functions apply to each item of the
     *  tuple and return a tuple.
     */
    ceil:  MapUU(x => isNumber(x) ? Math.ceil(x)  : NaN),
    floor: MapUU(x => isNumber(x) ? Math.floor(x) : NaN),
    trunc: MapUU(x => isNumber(x) ? Math.trunc(x) : NaN),
    round: MapUU(x => isNumber(x) ? Math.round(x) : NaN),
    

    /**
     *  ### Numb.abs - function
     *  Returns the absolute value of a number. 
     *  
     *  If the argument is not a number, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    abs: MapUU(x => isNumber(x) ? Math.abs(x) : NaN),


    /**
     *  ### Numb.exp - function
     *  Returns E^x, where x is the argument, and E is Euler's constant. 
     *  
     *  If the argument is not a number, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    exp: MapUU(x => isNumber(x) ? Math.exp(x) : NaN),
    
    
    /**
     *  ### Numb.log - function
     *  Returns the natural logarithm of a number. 
     *  
     *  If the argument is not a number, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    log: MapUU(x => isNumber(x) ? Math.log(x) : NaN),
    
    
    /**
     *  ### Numb.log10 - function
     *  Returns the base 10 logarithm of a number. 
     *  
     *  If the argument is not a number, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    log10: MapUU(x => isNumber(x) ? Math.log10(x) : NaN),
    
    
    /**
     *  ### Numb.max - function
     *  Returns the largest of zero or more numbers.
     *  If any argument is not a number, this functions return Undefined Number.
     */
    max: Math.max,


    /**
     *  ### Numb.min - function
     *  Returns the smallest of zero or more numbers.
     *  If any argument is not a number, this functions return Undefined Number.
     */
    min: Math.min,
    

    /**
     *  ### Numb.random - function
     *  Returns a pseudo-random number between 0 and the given argument.
     *  
     *  If the argument is not a number, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    random: MapUU(x => isNumber(x) ? Math.random()*x : NaN), 


    /**
     *  ### Numb.sqrt - function
     *  Returns the positive square root of a number.
     *  
     *  If any argument is not a number, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    sqrt: MapUU(x => isNumber(x) ? Math.sqrt(x) : NaN),
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

function isNumber (x) {
    return types.wrap(x) instanceof types.Numb;
}

function isString (x) {
    return types.wrap(x) instanceof types.Text;
}


function ensureBoolean (bool) {
    if (types.wrap(bool) instanceof types.Bool) return bool;
    throw new TypeError("Bool type expected");
}


function ensureNumber (x) {
    if (!isNumber(x)) throw new TypeError("Numb type expected");
    return x;
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
