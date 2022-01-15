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


exports.require = require("./modules").require;


const SyncMap = fn => (...values) => new types.Tuple(...values.map(fn)).unwrap();

const AsyncMap = fn => async (...values) => {
    const x = new types.Tuple(...values);
    const y = await x.vmapAsync(fn);
    return y.unwrap()
}

const undefined_text = new types.Undefined("Text");
const undefined_list = new types.Undefined("List");


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


module.exports = {}



// -----------------------------------------------------------------------------
//  Helper Functions
// -----------------------------------------------------------------------------

function isNumber (x) {
    return types.wrap(x) instanceof types.Numb;
}

function isString (x) {
    return types.wrap(x) instanceof types.Text;
}

function isList (list) {
    return Array.isArray(list);
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
