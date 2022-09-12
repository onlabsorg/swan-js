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
     *  TRUE: Bool
     *  ----------------------------------------------------------------------------
     *  This constant represent the boolean true value in swan.
     */
    TRUE: true,
    
    
    /**
    *  FALSE: Bool
    *  ----------------------------------------------------------------------------
     *  This constant represent the boolean false value in swan.
     */
    FALSE: false,


    /**
     *  bool: Term t -> Bool b
     *  ----------------------------------------------------------------------------
     *  
     *  Given a swan term X, the `bool.from` function returns TRUE if the
     *  term is truty, otherwise it returns FALSE.
     *  
     *  Falsy elements are: `FALSE`, `0`, `""`, `[]`, `{}`, `()`, an any 
     *  Undefined item and any tuple containing only falsy elements.
     *  
     *  Any other term is truty.
     */
    bool (...values) {
        return new types.Tuple(...values).toBoolean();
    },
    
    
    /**
     *  dom: Mapping m -> Tuple t
     *  ------------------------------------------------------------------------
     *  Returns the domain of the passed mappings m, which is:
     *  
     *  - The tuple (0,1,2,...,size(m)-1) if m is a Text item
     *  - The tuple (0,1,2,...,size(m)-1) if m is a List item
     *  - The tuple of the name mapped by m if m is a Namespace item
     *  
     *  If m is not a Mapping item, it returns Undefined Term.
     *  If the argument is a tuple, it applies only to its first item.
     */
    dom (x) {
        const X = types.wrap(x);
        return X instanceof types.Mapping ? new types.Tuple(...X.domain) : new Undefined("Term");
    },


    /**
     *  not: Term t -> Bool b
     *  ----------------------------------------------------------------------------
     *  
     *  Given a swan term X, the `bool.not` function returns FALSE if the
     *  term is truty, otherwise it returns TRUE.
     *  
     *  For the definition of truty and falsy terms, see `bool.from`.
     */
    not (...values) {
        return !builtins.bool(...values);
    },


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
    range (n) {
        if (types.wrap(n) instanceof types.Numb) {
            let range = new types.Tuple();
            for (let i=0; i<n; i++) {
                range = new types.Tuple(range, i);
            }
            return range;
        } else {
            return new types.Undefined("Tuple");
        }
    },
    
    
    /**
     *  require: Text id -> Namespace m
     *  ----------------------------------------------------------------------------
     *  This function loads the swan standard module identified by `id` and returns
     *  it as a Namespace item.
     *  
     *  If `id` is a tuple, it applies only to its first item.
     */
    async require (module_id) {
        
        const modules = require('./modules');
        const payload = await modules[module_id]();
        const module = payload.default || payload;
        
        if (typeof module === "function") {
            return module(types);
        } else {
            return module
        }    
    },
    
    
    /**
     *  size: Mapping m -> Numb n
     *  ------------------------------------------------------------------------
     *  Returns the number of mappings in m, which is:
     *  
     *  - The number of characters if m is a Text item
     *  - The number of items if m is a List item
     *  - The number of names:value pairs if m is a Namespace item
     *  
     *  If m is not a Mapping item, it returns Undefined Number.
     *  If the argument is a tuple, it applies only to its first item.
     */
    size (x) {
        const X = types.wrap(x);
        return X instanceof types.Mapping ? X.size : NaN;
    },


    // str: Term x -> Text s
    // Converts the term x to string.
    async str (...values) {
        const term = new types.Tuple(...values);
        const textTuple = await term.imapAsync(async (item) => {
            if (item instanceof types.Namespace) {
                const __str__ = item.apply("__str__");
                if (__str__ instanceof types.Func) {
                    return await __str__.apply(item);
                }
            }
            return item;
        });
        return textTuple.toString();
    },
    

    /**
     *  type: Item x -> Text t
     *  ----------------------------------------------------------------------------
     *  Given any item it returns the name of its type: `"Bool"` for Bool items,
     *  `"Numb"` for Numb items, etc.
     *  
     *  If `x` is a tuple, it returns a tuple of type names.
     */
    type (...values) {
        return new types.Tuple(...values).imapSync(X => X.typeName).unwrap();
    },
    
    
    /**
     *  parent: Namespace x -> Namespace p
     *  ------------------------------------------------------------------------
     *  Given a namespace, returns its parent namespace or Undefined Namespace 
     *  if the given namespace has no parent or if `x` is not a namespace.
     *  
     *  If `x` is a tuple, it returns a tuple of parent namespaces.
     */
    parent (...namespaces) {
        return new types.Tuple(...namespaces).imapSync(item => {
            if (item instanceof types.Namespace) {
                const parent = item.vmapSync(Object.getPrototypeOf);
                if (parent instanceof types.Namespace) return parent;
            }
            return new types.Undefined('Namespace');
        }).unwrap()
    },
    
    
    /**
     *  undefined: (Text t, Tuple a) -> Undefined u
     *  ----------------------------------------------------------------------------
     *  This function returns an `Undefined` item with type `t` and arguments `a`.
     */
    undefined (type, ...args) {
        return new types.Undefined(type, ...args);
    },
    
    /**
     *  this: Namespace
     *  ----------------------------------------------------------------------------
     *  This function returns the current context.
     */
    get this () {
        return this;
    }
}
