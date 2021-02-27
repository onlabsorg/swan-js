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

T.Anything.__bool__  = self => F.error(`Casting to Boolean is not defined for ${T.detectType(self)} type`);
T.Nothing.__bool__   = self => T.FALSE;
T.Boolean.__bool__   = self => self;
T.Number.__bool__    = self => self != 0;
T.Function.__bool__  = self => T.TRUE;
T.Sequence.__bool__  = self => self.length !== 0;
T.Namespace.__bool__ = self => names(self).length !== 0;
T.Tuple.__bool__     = async self => {
    for (let item of self) {
        if (await F.bool(item)) return T.TRUE;
    }
    return T.FALSE;        
};

F.bool = async x => T.resolveName(x, '__bool__')(x);



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
 
T.Sequence.__enum__  = self => T.createTuple(...self);
T.Namespace.__enum__ = self => T.createTuple(...names(self));
T.Anything.__enum__      = self => F.error(`Enumeration not defined for ${T.detectType(self)} type`);

F.enum = x => T.resolveName(x, '__enum__')(x);



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
 
T.List.__filter__ = async (self, f) => {
    let filteredList = [];
    for (let item of self) {
        if (await F.bool(await f(item))) filteredList.push(item);
    }
    return filteredList;
};

T.Namespace.__filter__ = async (self, f) => {
    let filteredNamespace = {};
    for (let name of names(self)) {
        let value = self[name];
        if (await F.bool(await f(value))) filteredNamespace[name] = value;
    }
    return filteredNamespace;
};

T.Anything.__filter__ = (self, f) => F.error(`Filtering not defined for ${T.detectType(self)} type`);

F.filter = T.defineFunction({
    "Function" : f => T.defineFunction({
        "Anything" : x => T.resolveName(x, '__filter__')(x,f)
    }),
    "Anything" : a => F.error(`The 'filter' function requires a function as argument`)
});



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
 
T.List.__map__ = async (self, f) => {
    const image = [];
    for (let item of self) image.push(await f(item));
    return image;
};

T.Namespace.__map__ = async (self, f) => {
    const image = {};
    for (let name of names(self)) {
        image[name] = await f(self[name]);
    }
    return image;    
};

T.Anything.__map__ = async (self, f) => F.error(`Mapping not defined for ${T.detectType(self)} type`)
 
F.map = T.defineFunction({
    "Function" : f => T.defineFunction({
        "Anything" : x => T.resolveName(x, '__map__')(x, f)
    }),
    "Anything" : a => F.error(`The 'map' function requires a function as argument`)
});



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
 
T.Sequence.__size__  = self => self.length;
T.Namespace.__size__ = self => names(self).length;
T.Anything.__size__      = self => F.error(`Size not defined for ${T.detectType(self)} type`);

F.size = async x => T.resolveName(x, '__size__')(x);



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

T.Nothing.__str__   = async self => "",
T.Boolean.__str__   = async self => self ? "TRUE" : "FALSE",
T.Number.__str__    = async self => String(self),
T.Function.__str__  = async self => T.isFunction(self.toSource) ? await self.toSource() : "[[Function]]",
T.String.__str__    = async self => self,
T.List.__str__      = async self => `[[List of ${self.length} items]]`,
T.Namespace.__str__ = async self => `[[Namespace of ${names(self).length} items]]`,
T.Tuple.__str__     = async self => Array.from(await self.map(F.str)).join(""),
T.Anything.__str__  = async self => T.error(`Casting to String is not defined for ${T.detectType(self)} type`)

F.str = x => T.resolveName(x, '__str__')(x);



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
