/**
 *  Swan Builtins
 *  ============================================================================
 *  
 *  The swan builtins is a collection of functions and constants that are
 *  always present in a swan context.
 */

const types = require("./types");



const builtins = module.exports = {
        
    /**
     *  `require: Text id -> Namespace m`
     *  ----------------------------------------------------------------------------
     *  This function loads the swan standard module identified by `id` and returns
     *  it as a Namespace item.
     *
     *  If `id` is a tuple, it returns the corresponding tuple of modules.
     */
    async require (...module_ids) {
        const modules = require('./modules');
        const id_tuple = new types.Tuple(...module_ids)
        const modules_tuple = await id_tuple.imapAsync(async module_id => {
            const payload = await modules[module_id]();
            const module = payload.default || payload;

            if (typeof module === "function") {
                return module(types);
            } else {
                return module
            }
        });
        return modules_tuple.normalize();
    },
    
    
    /**
     *  `type: Item x -> Text t`
     *  ----------------------------------------------------------------------------
     *  Given any item, it returns the name of its type; i.e.:
     *  
     *  - it returns`"Bool"` if x is a Bool item
     *  - it returns`"Numb"` if x is a Numb item
     *  - it returns`"Text"` if x is a Text item
     *  - it returns`"List"` if x is a List item
     *  - it returns`"Namespace"` if x is a Namespace item
     *  - it returns`"Func"` if x is a Func item
     *  - it returns`"Undefined"` if x is an Undefined item
     *  
     *  If `x` is a tuple, it returns a tuple of type names. As a consequence of
     *  this behavior, it returns `()` if `x` is an empty Tuple.
     */
    type (...values) {
        return new types.Tuple(...values).imapSync(X => X.typeName).normalize();
    },
        
    
    /**
     *  `this: Namespace`
     *  ----------------------------------------------------------------------------
     *  This name always maps to the current context.
     */
    get this () {
        return new types.Namespace(this);
    },


    /**
     *  `TRUE: Bool`
     *  ----------------------------------------------------------------------------
     *  This constant represent the boolean true value in swan.
     */
    TRUE: new types.Bool(true),


    /**
     *  `FALSE: Bool`
     *  ----------------------------------------------------------------------------
     *  This constant represent the boolean false value in swan.
     */
    FALSE: new types.Bool(false),


    /**
     *  `bool: Term x -> Bool b`
     *  ----------------------------------------------------------------------------
     *  Given a swan term `x`, the `bool` function returns:
     *
     *  - `FALSE` if x is `FALSE`
     *  - `FALSE` if x is `0`
     *  - `FALSE` if x is `""`
     *  - `FALSE` if x is `[]`
     *  - `FALSE` if x is `{}`
     *  - `FALSE` if x is `()`
     *  - `FALSE` if x is an `Undefined` item
     *  - `FALSE` if x is a tuple containing only items that booleanize to `FALSE`
     *  - `TRUE` in any other case
     */
    bool (...values) {
        return new types.Bool(new types.Tuple(...values).toBoolean());
    },


    /**
     *  `not: Term x -> Bool b`
     *  ----------------------------------------------------------------------------
     *  Given a swan term `x`, the `not` function returns:
     *
     *  - `FALSE` if `bool x` returns `TRUE`
     *  - `TRUE` if `bool x` returns `FALSE`
     */
    not (...values) {
        return new types.Bool(!(new types.Tuple(...values).toBoolean()));
    },


    /**
     *  enum: Term x -> Tuple t
     *  -------------------------------------------------------------------------
     *  Converts the term `x`` to a tuple, according to the tollowing rules:
     *
     *  - if x is a Numb item, it returns (0, 1, 2, ...) up to the first integer smaller than x
     *  - if x is a Text item, it returns the tuple of all the characters of x
     *  - if x is a List item, it returns the tuple of all the items of x
     *  - if x is a Namespace item, it returns the tuple of all the names of x
     *
     *  For any other type, it returns Undefined Enumeration.
     *
     *  If x is a tuple `(x1, x2, ...)` it returns `(enum x1, enum x2, ...)`.
     */
    enum (...items) {

        return new types.Tuple(...items).imapSync(item => {

            // If a number ...
            if (item instanceof types.Numb) {
                let n = types.unwrap(item);
                let tuple = new types.Tuple();
                for (let i=0; i<n; i++) {
                    tuple = new types.Tuple(tuple, i);
                }
                return tuple;
            }

            // If a namespace ...
            if (item instanceof types.Namespace) {
                return new types.Tuple(...item.domain);
            }

            // If a sequence ...
            if (item instanceof types.Sequence) {
                return new types.Tuple(...item.image);
            }

            // If undefined ...
            if (item instanceof types.Undefined) {
                return new types.Tuple(item.type, ...item.args);
            }

            return new types.Undefined("Enumeration", item);
        }).normalize();
    },
    

    /**
     *  tsize: Term t -> Numb n
     *  -------------------------------------------------------------------------
     *  Given a tuple `t` it returns the number of items it contains. Consistently,
     *  it returns `1` if `t` is an item and `0` if `t` is the empty tuple.
     */
    tsize (...X) {
        const size = Array.from(new types.Tuple(...X)).length;
        return new types.Numb(size);
    },

    
    /**
     *  msize: Mapping m -> Numb n
     *  -------------------------------------------------------------------------
     *  Given a Mapping item `m` it returns the number of items it contains, or
     *  undefined("Size") if m is not a Mapping item.
     *
     *  If `m` is a tuple, it returns a tuple of mapping sizes.
     */
    msize (...X) {
        return new types.Tuple(...X).imapSync(item => {
            if (item instanceof types.Mapping) {
                return item.size;
            } else {
                return new types.Undefined("Size", item);
            }
        }).normalize();
    },

    
    /**
     *  `str: Term X -> Text s`
     *  ------------------------------------------------------------------------
     *  The `str` function takes any term `X` as argument and converts it
     *  to a Text item according to the following rules:
     *
     *  - if `X` is a `Bool` item it either returns `"TRUE"` or `"FALSE"`
     *  - if `X` is a `Numb` item it returns the number as a string
     *  - if `X` is a `Text` item it teturns `X`
     *  - if `X` is a `List` item it returns `"[[List of <n> items]]"` where
    . *    `<n>` is the size of `X`
     *  - if `X` is a `Namespace` item it returns `"[[Namespace of <n> items]]"`
     *    where `<n>` is the size of `X`.
     *  - if `X` is a `Namespace` item and `X.__text__` is a Text item, it
     *    returns `X.__text__`.
     *  - if `X` is a `Func` item, it returns `"[[Func]]"`
     *  - if `X` is an `Undefined` item it returns `"[[Undefined <type>]]"`,
     *    where `<type>` is the Undefined operaton type.
     *  - if `X` is a `Tuple` term, it returns the concatenation of all its
     *    items stringified with `Text`. As a particular case, if `X` is an
     *    empty tuple, it returns `""`
     */
    str (...values) {
        const term = new types.Tuple(...values);
        const textTuple = term.imapSync((item) => {
            if (item instanceof types.Namespace) {
                const __text__ = item.apply("__text__");
                if (__text__ instanceof types.Text) return __text__;
            }
            return item;
        });
        return new types.Text(textTuple.toString());
    },


    /**
     *  `parent: Namespace x -> Namespace p`
     *  ------------------------------------------------------------------------
     *  Given a Namespace `x`, returns its parent namespace or `Undefined Namespace`
     *  if the `x` has no parent or if `x` is not a Namespace item. If `x`
     *  is a tuple, it applies to all its items.
     */
    parent (...X) {
        return new types.Tuple(...X).imapSync(item => {
            if (item instanceof types.Namespace) {
                const parent = item.vmapSync(Object.getPrototypeOf);
                if (parent instanceof types.Namespace) return parent;
            }
            return new types.Undefined('Namespace');
        }).normalize();
    },


    /**
     *  `own: Namespace x -> Namespace o`
     *  ------------------------------------------------------------------------
     *  Given a namespace `x`, returns a copy of its own names, enclosed in a
     *  parent-less namespace. It returns Undefined Namespace if `x` is not
     *  a namespace. If `x` is a tuple, it applies to all its items.
     */
    own (...X) {
        return new types.Tuple(...X).imapSync(item => {
            if (item instanceof types.Namespace) {
                return item.vmapSync(ns => Object.assign(Object.create(null), ns));
            } else {
                return new types.Undefined('Namespace');
            }
        }).normalize();
    },
    

    /**
     *  `undefined: (Text t, Tuple a) -> Undefined u`
     *  ----------------------------------------------------------------------------
     *  This function returns an `Undefined` item with type `t` and arguments `a`.
     */
    undefined (type, ...args) {
        return new types.Undefined(type, ...args);
    }
}
