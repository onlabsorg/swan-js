/**
 *  text module
 *  ----------------------------------------------------------------------------
 *  
 *  This module contains functions that operate on the swan Text data type.
 */
 
module.exports = types => {
    const text = {};
    
    const SyncMap = fn => (...values) => new types.Tuple(...values.map(fn)).unwrap();

    const AsyncMap = fn => async (...values) => {
        const x = new types.Tuple(...values);
        const y = await x.vmapAsync(fn);
        return y.unwrap()
    }
    
    const undefined_text = new types.Undefined("Text");

    const isNumber = x => types.wrap(x) instanceof types.Numb;
    const isString = x => types.wrap(x) instanceof types.Text;


    /**
     *  ### text.from - function
     *  
     *  This function takes any term `X` as argument and converts it into a Text
     *  item according to the following rules:
     *  
     *  - if `X` is a `Bool` item it either returns `"TRUE"` or `"FALSE"`
     *  - if `X` is a `Numb` item it returns the number as a string
     *  - if `X` is a `Text` item it teturns `X`
     *  - if `X` is a `List` item it returns `"[[List of <n> items]]"` where 
     *    `<n>` is the size of `X`
     *  - if `X` is a `Namespace` item it returns its comma-separated list of
     *    keys, enclosed between curly braces.
     *      - if `X` is a `Namespace` item and `X.__text__` exists and is not a 
     *        Func item, it returns `Text.from(X.__text__)`
     *      - if `X` is a `Namespace` item and `X.__text__` is not a Func item,
     *        it returns `Text.from(X.__text__(X))`
     *  - if `X` is a `Func` item, it returns `"[[Func]]"`
     *  - if `X` is a `Undefined` item it returns `"[[Undefined <type>]]"`,
     *    where `<type>` is the Undefined operaton type.
     *  - if `X` is a `Tuple` term, it returns the concatenation of all its
     *    items stringified with `Text.from`.
     *      - As a particular case, if `X` is an empty tuple, it returns `""`
     */
    text.from = async (...values) => {
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
    }

    
    /**
     *  ### text.size - function
     *  Returns a string length
     *  
     *  If the argument is not a Text item, this functions return Undefined text.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    text.size = SyncMap(s => isString(s) ? s.length : NaN);
    
    
    /**
     *  ### text.find
     *  Takes a string `s` as argument and returns a function `f`. If the 
     *  argument is a tuple, it reurns a tuple of functions `fi`, one for each
     *  item `si` of the argument tuple.
     *  
     *  Each function `fi` takes a string `S` as argument and returns the first
     *  position of `si` in `S` or `-1` if `si` is not contained in `S`.
     *  
     *  If the argument of `fi` is not a Text item, `fi` returns Undefined text.
     *  
     *  If the parameter of `fi` is a tuple, it applies to each item of the
     *  tuple and returns a tuple.
     */
    text.find = SyncMap(s1 => AsyncMap(s2 => isString(s1) && isString(s2) ? s2.indexOf(s1) : undefined_text));


    /**
     *  ### text.find
     *  Takes a string `s` as argument and returns a function `f`. If the 
     *  argument is a tuple, it reurns a tuple of functions `fi`, one for each
     *  item `si` of the argument tuple.
     *  
     *  Each function `fi` takes a string `S` as argument and returns the last 
     *  position of `si` in `S` or `-1` if `si` is not contained in `S`.
     *  
     *  If the argument of `fi` is not a Text item, `fi` returns Undefined text.
     *  
     *  If the parameter of `fi` is a tuple, it applies to each item of the
     *  tuple and returns a tuple.
     */
    text.rfind = SyncMap(s1 => AsyncMap(s2 => isString(s1) && isString(s2) ? s2.lastIndexOf(s1) : undefined_text));
    

    /**
     *  ### text.lower - function
     *  Returns the passed string in lower-case. 
     *  
     *  If the argument is not a Text item, this functions return Undefined text.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    text.lower = SyncMap(str => isString(str) ? str.toLowerCase() : undefined_text);
    

    /**
     *  ### text.upper - function
     *  Returns the passed string in upper-case. 
     *  
     *  If the argument is not a Text item, this functions return Undefined text.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    text.upper = SyncMap(str => isString(str) ? str.toUpperCase() : undefined_text);
    
    
    /**
     *  ### text.lower - function
     *  Removed the leading and trailing spaces from the given string.
     *  
     *  If the argument is not a Text item, this functions return Undefined text.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    text.trim = SyncMap(s => isString(s) ? s.trim() : undefined_text);


    /**
     *  ### text.lower - function
     *  Removed the leading spaces from the given string.
     *  
     *  If the argument is not a Text item, this functions return Undefined text.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    text.trim_head = SyncMap(s => isString(s) ? s.trimStart() : undefined_text);


    /**
     *  ### text.lower - function
     *  Removed the trailing spaces from the given string.
     *  
     *  If the argument is not a Text item, this functions return Undefined text.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    text.trim_tail = SyncMap(s => isString(s) ? s.trimEnd() : undefined_text);
    

    /**
     *  ### text.head
     *  Takes a number `n` as argument and returns a function `f`. If the 
     *  argument is a tuple, it reurns a tuple of functions `fi`, one for each
     *  item `ni` of the argument tuple.
     *  
     *  Each function `fi` takes a string `s` as argument and returns the
     *  substring at the left-side of the n-th character. If n is negative, the 
     *  character position is computed as relative to the end of the `s`.
     *  
     *  If the argument of `fi` is not a Text item, `fi` returns Undefined text.
     *  
     *  If the parameter of `fi` is a tuple, it applies to each item of the
     *  tuple and returns a tuple.
     */
    text.head = SyncMap(n => AsyncMap(s => isNumber(n) && isString(s) ? s.slice(0,n) : undefined_text));
    

    /**
     *  ### text.tail
     *  Takes a number `n` as argument and returns a function `f`. If the 
     *  argument is a tuple, it reurns a tuple of functions `fi`, one for each
     *  item `ni` of the argument tuple.
     *  
     *  Each function `fi` takes a string `s` as argument and returns the
     *  substring at the right-side of the n-th character (including the latter). 
     *  If n is negative, the character position is computed as relative to the 
     *  end of the `s`.
     *  
     *  If the argument of `fi` is not a Text item, `fi` returns Undefined text.
     *  
     *  If the parameter of `fi` is a tuple, it applies to each item of the
     *  tuple and returns a tuple.
     */
    text.tail = SyncMap(n => AsyncMap(s => isNumber(n) && isString(s) ? s.slice(n) : undefined_text));


    /**
     *  ### text.split - function
     *  Takes a string `s` as argument and returns a function `f`. If the 
     *  argument is a tuple, it reurns a tuple of functions `fi`, one for each
     *  item `si` of the argument tuple.
     *  
     *  Each function `fi` takes a string `S` as argument and returns the list
     *  of substring separated by s. For example, if the divider is `s=":"` and
     *  the string is `S="a:b:c"`, the function `fi` returns `["a","b","c"].
     *  
     *  If the argument of `fi` is not a Text item, `fi` returns Undefined text.
     *  
     *  If the parameter of `fi` is a tuple, it applies to each item of the
     *  tuple and returns a tuple.
     */
    text.split = SyncMap(s1 => AsyncMap(s2 => isString(s1) && isString(s2) ? s2.split(s1) : undefined_text)); 
    
    return text;   
}
