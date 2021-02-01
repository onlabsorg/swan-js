/**
 *  Swan built-in functions
 *  ============================================================================
 */

const T = require('./types');
const F = module.exports = {};



/**
 *  bool x
 *  ----------------------------------------------------------------------------
 *  It returns `FALSE` if `x` is one of `()`, `FALSE`, `0`, `""`, `[]`, `{}` or
 *  a tuple containing only items that bool to false.
 *
 *  In all the other cases it returns `TRUE`.
 */

F.bool = T.defineFunction({
    "Nothing"  : x => T.FALSE,
    "Boolean"  : x => x,
    "Number"   : x => x != 0,
    "Function" : x => T.TRUE,
    "String"   : x => x.length !== 0,
    "List"     : x => x.length !== 0,
    "Namespace": x => names(x).length !== 0,
    "Tuple"    : x => convertTupleToBoolean(x),
    "Anything" : x => F.error(`Casting to Boolean is not defined for ${T.detectType(x)} type`)
});

async function convertTupleToBoolean (tuple) {
    for (let item of tuple) {
        if (await F.bool(item)) return T.TRUE;
    }
    return T.FALSE;
}


/**
 *  enum x
 *  ----------------------------------------------------------------------------
 *  It returns the tuple of the items contained in x. In particular:
 *
 *  - if x is a list like `[x1, x2, x3, ...]`, it returns the tuple `(x1, x2, x3, ...)`
 *  - if x is a string like `"abc..."`, it returns the tuple `('a', 'b', 'c', ...)`
 *  - if x is a namespace like `{name1:val1, name2:val2, ...}`, it returns the tuple `('name1', 'name2', ...)`
 *
 *  It throws an error if x in not a string, a list or a namespace.
 */
F.enum = T.defineFunction({
    "String"    : x => T.createTuple(...x),
    "List"      : x => T.createTuple(...x),
    "Namespace" : x => T.createTuple(...names(x)),
    "Anything"  : x => F.error(`Enumeration not defined for ${T.detectType(x)} type`)
});



/**
 *  error msg
 *  ----------------------------------------------------------------------------
 *  Throws an error with the given message.
 *  If message is not a string, it throws a type error.
 */
F.error = T.defineFunction({
    "String"   : x => {throw new Error(x)},
    "Anything" : x => {throw new Error(`The 'error' function requires a string as agrument`)}
});



/**
 *  filter f [x1, x2, x3, ...]
 *  ----------------------------------------------------------------------------
 *  Returns a sub-listnof the passed list, containing only the items `xi` that
 *  verify the condition `bool(f xi) == TRUE`.
 *
 *  For example, `filter (x -> x>0) [0,1,-3,7,-12, 3]` returns `[1,7,3]`.
 */
F.filter = T.defineFunction({
    "Function" : f => T.defineFunction({
        "List"      : x => filterList(f, x),
        "Namespace" : x => filterNamespace(f, x),
        "Anything"  : x => F.error(`Filtering not defined for ${T.detectType(x)} type`)
    }),
    "Anything" : a => F.error(`The 'filter' function requires a function as argument`)
});

async function filterList (f, list) {
    let filteredList = [];
    for (let item of list) {
        if (await F.bool(await f(item))) filteredList.push(item);
    }
    return filteredList;
}

async function filterNamespace (f, namespace) {
    let filteredNamespace = {};
    for (let name of names(namespace)) {
        let value = namespace[name];
        if (await F.bool(await f(value))) filteredNamespace[name] = value;
    }
    return filteredNamespace;

}


/**
 *  iter f x
 *  ----------------------------------------------------------------------------
 *  The iter function takes a function as argument and return another function
 *  `fn x` that takes a tuple `(a, b, c, ...)` as argument and returns
 *  `(f(a), f(b), f(c) ...)`.
 *
 *  If the parameter passed to map is not a function, it throws an error.
 */
F.iter = T.defineFunction({
    "Function" : f => T.defineFunction({
        "Tuple"    : x => x.map(f),
        "Anything" : x => f(x)
    }),
    "Anything" : a => F.error(`The 'iter' function requires a function as parameter`)
});



/**
 *  map f x
 *  ----------------------------------------------------------------------------
 *  The map function takes a function as argument and return another function
 *  `fn x` that be have as follows:
 *
 *  - when `x = [x1, x2, x3, ...]` returns `[f(x1), f(x2), f(x3), ...]`
 *  - when `x = {name1:val1, name2:val2, ...}` returns `{name1:f(val1), name2:f(val2), ...}`
 *  - when `x` is of any other type, it trows an error
 *
 *  If the parameter passed to map is not a function, it throws an error.
 */
 F.map = T.defineFunction({
     "Function" : f => T.defineFunction({
         "List"      : x => mapList(f, x),
         "Namespace" : x => mapNamespace(f, x),
         "Anything"  : x => F.error(`Mapping not defined for ${T.detectType(x)} type`)
     }),
     "Anything" : a => F.error(`The 'map' function requires a function as argument`)
 });

async function mapList (f, list) {
    const image = [];
    for (let item of list) image.push(await f(item));
    return image;
}

async function mapNamespace (f, namespace) {
    const image = {};
    for (let name of names(namespace)) {
        image[name] = await f(namespace[name]);
    }
    return image;
}


/**
*  not x
*  ----------------------------------------------------------------------------
*  It returns `FALSE` if `bool x` is `TRUE` and vice-versa.
*/
F.not = async (...args) => !(await F.bool(...args));


/**
 *  range n
 *  ----------------------------------------------------------------------------
 *  Given a number `n`, it returns a tuple containing all the integers between
 *  `0` (included) and `n` (excluded).
 *
 *  For example:
 *  - `range 4` returns `(0, 1, 2, 3)`
 *  - `range 3.2` returns `(0, 1, 2)`
 *  - `range -6` returns `(0, -1, -2, -3, -4, -5)`
 *  - `range -3.9` returns `(0, -1, -2)`
 *
 *  It throws an error if `n` is not a number.
 */
F.range = T.defineFunction({
    "Number"   : x => createRange(Math.trunc(x)),
    "Anything" : x => F.error(`Range not defined for ${T.detectType(x)} type`)
});

function createRange (n) {
    var range = T.NOTHING;
    if (n > 0) for (let i=0; i<n; i++) {
        range = T.createTuple(range, i);
    } else if (n < 0) for (let i=0; i>n; i--) {
        range = T.createTuple(range, i);
    }
    return range;
}


/**
 *  reduce f
 *  ----------------------------------------------------------------------------
 *  Takes a function of two parameters `f(a,b)` and returns a reducer function `r`.
 *
 *  The reducer function `r` takes a tuple of parameters `(x1, x2, x3, ...)` and
 *  reduces them to a single value as follows:
 *  - accumulator = x1
 *  - accumulator = f(accumulator, x2)
 *  - accumulator = f(accumulator, x3)
 *  - ...
 *  The value of `accumulator` after iterating over all the `r` arguments, is
 *  the return value of `r`.
 *
 *  If a single value `x` is passed to `r`, `r(x)` will return x.
 *  If `r` is called with no arguments, `r()` will return `()`.
 */
F.reduce = T.defineFunction ({
    "Function" : f => createReducer(f),
    "Anything" : a => F.error("The 'reduce' function requires a function as argument")
});

const createReducer = f => async (...args) => {
    const items = iterArguments(args);

    const firstItem = items.next();
    if (firstItem.done) return null;

    let accumulator = firstItem.value;
    while (true) {
        let item = items.next();
        if (item.done) return accumulator;
        accumulator = await f(accumulator, item.value);
    }
}


/**
 *  size x
 *  ----------------------------------------------------------------------------
 *  Returns the number of items contained in the passed object x.
 *
 *  - if `x` is a string, it returns the number of characters of the string
 *  - if `x` is a list, it returns the number of items in the list
 *  - if `x` is a namespace, it returns the number of names it contains
 *  - if `x` is of any other type, it throws an error
 */
F.size = T.defineFunction({
    "String"    : x => x.length,
    "List"      : x => x.length,
    "Namespace" : x => names(x).length,
    "Anything"  : x => F.error(`Size not defined for ${T.detectType(x)} type`),
});



/**
 *  str x
 *  ----------------------------------------------------------------------------
 *  The `str` function convers `x` to a string as follows:
 *  - if `x` is an empty tuple, it resolves to an empty string `""`
 *  - if `x` is `TRUE`, it resolves to `"TRUE"`
 *  - if `x` is `FALSE`, it resolves to `"FALSE"`
 *  - if `x` is a number, it stringifies the number (e.g. `str 1.23` resolves to `"1.23"`)
 *  - if `x` is a string, it resolves to `x` itself
 *  - if `x` is a list, it resolves to `"[[List of n items]]"`, where `n` is the number
 *    of items in the list
 *  - if `x` is a namespace, it resolves to `"[[Namespace of n items]]"`, where
 *    `n` is the number of names contained in the namespace
 *  - if `x` is a namespace and `x.__str__` is a function, it returns `x.__str__(x)`
 *  - if `x` is a Swan function, it resolves to the function source
 *  - if `x` is a javascript function, it resolves to `"[[Function]]"`
 *  - if `x` is a tuple `(x1,x2,x3,...)`, it resolves to `(str x1) + (str x2) +
 *    (str x3) + ...`
 */
F.str = T.defineFunction({
    "Nothing"  : async x => "",
    "Boolean"  : async x => x ? "TRUE" : "FALSE",
    "Number"   : async x => String(x),
    "Function" : async x => T.isFunction(x.toSource) ? await x.toSource() : "[[Function]]",
    "String"   : async x => x,
    "List"     : async x => `[[List of ${x.length} items]]`,
    "Namespace": async x => T.isFunction(x.__str__) ? F.str(await x.__str__(x)) : `[[Namespace of ${names(x).length} items]]`,
    "Tuple"    : async x => Array.from(await x.map(F.str)).join(""),
    "Anything" : async x => T.error(`Casting to String is not defined for ${T.detectType(x)} type`)
});


/**
 *  type x
 *  ----------------------------------------------------------------------------
 *  This function returns a string containing the type name of the passed object.
 *  In detail, it returns:
 *
 *  - It returns `"Nothing"` if x is `()` or a JavaScript `null`, `undefined` or `NaN`
 *  - It returns `"Boolean"` if x is true or false
 *  - It returns `"Number"` if x is a number
 *  - It returns `"String"` if x is a string
 *  - It returns `"List"` if x is an list or a javascript array
 *  - It returns `"Namespace"` if x is a swan namespace or a JavasCript object
 *  - It returns `"Function"` if x is a function
 *  - It returns `"Tuple"` if x is a tuple containing more than one item
 */
F.type = T.detectType;



// -----------------------------------------------------------------------------
//  SERVICE FUNCTIONS
// -----------------------------------------------------------------------------

const names = ns => Object.getOwnPropertyNames(ns);

const normalizeArguments = args => args.length > 1 ? T.createTuple(...args) : args[0];

const iterArguments = (argList) => T.iter(normalizeArguments(argList));
