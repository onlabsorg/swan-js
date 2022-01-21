/**
 *  Swan Builtins
 *  ============================================================================
 *  
 *  The swan builtins is a collection of functions and constants that are
 *  always present in a swan context.
 */

const types = require("./types");


/**
 *  range: Numb n -> Numb Typle r
 *  ----------------------------------------------------------------------------
 *  Given a number `n`, this function returns the tuple of integers
 *  (0, 1, 2, ..., m), where m is the highest integer lower than m.
 *  
 *  For example:
 *  - `range 4` returns `(0,1,2,3)`
 *  - `range 5.1` return `(0,1,2,3,4,5)`
 *  
 *  If `n` is not a number, this function returns Undefined Tuple.
 *  If `n` is a tuple, only its first item will be considered.
 */
exports.range = n => {
    if (types.wrap(n) instanceof types.Numb) {
        let range = new types.Tuple();
        for (let i=0; i<n; i++) {
            range = new types.Tuple(range, i);
        }
        return range;
    } else {
        return new types.Undefined("Tuple");
    }
}

/**
 *  require: Text id -> Namespace m
 *  ----------------------------------------------------------------------------
 *  This function loads the swan standard module identified by `id` and returns
 *  it as a Namespace item.
 *  
 *  If `id` is a tuple, it applies only to its first item.
 */
exports.require = async (module_id) => {
    
    const modules = require('./modules');
    const payload = await modules[module_id]();
    const module = payload.default || payload;
    
    if (typeof module === "function") {
        return module(types);
    } else {
        return module
    }    
}



/**
 *  type: Item x -> Text t
 *  ----------------------------------------------------------------------------
 *  Given any item it returns the name of its type: `"Bool"` for Bool items,
 *  `"Numb"` for Numb items, etc.
 *  
 *  If `x` is a tuple, it returns a tuple of type names.
 */
exports.type = (...values) => new types.Tuple(...values).imapSync(X => X.typeName).unwrap();


/**
 *  undefined: (Text t, Tuple a) -> Undefined u
 *  ----------------------------------------------------------------------------
 *  This function returns an `Undefined` item with type `t` and arguments `a`.
 */
exports.undefined = (type, ...args) => new types.Undefined(type, ...args);

