/**
 *  Swan Builtins
 *  ============================================================================
 *  
 *  The swan builtins is a collection of functions and constants that are
 *  always present in a swan context.
 */

const types = require("./types");
const isNumb = x => types.wrap(x) instanceof types.Numb;
const isText = x => types.wrap(x) instanceof types.Text;
const isList = x => types.wrap(x) instanceof types.List;
const isFunc = x => types.wrap(x) instanceof types.Func;
const isUndefined = x => types.wrap(x) instanceof types.Undefined;
const undefined_text = new types.Undefined("Text");
const undefined_list = new types.Undefined("List");




const builtins = module.exports = {
        
    /**
     *  `require: Text id -> Namespace m`
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
     *  `type: Item x -> Text t`
     *  ----------------------------------------------------------------------------
     *  Given any item it returns the name of its type; i.e.: 
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
        return new types.Tuple(...values).imapSync(X => X.typeName).unwrap();
    },
        
    
    /**
     *  `this: Namespace`
     *  ----------------------------------------------------------------------------
     *  This name always maps to the current context.
     */
    get this () {
        return this;
    },
    
    
    Bool: {
        
        /**
         *  `Bool: Term x -> Bool b`
         *  ----------------------------------------------------------------------------
         *  Given a swan term `x`, the `Bool` callable returns:
         *
         *  - `Bool.FALSE` if x is `Bool.FALSE`
         *  - `Bool.FALSE` if x is `0`
         *  - `Bool.FALSE` if x is `""`
         *  - `Bool.FALSE` if x is `[]`
         *  - `Bool.FALSE` if x is `{}`
         *  - `Bool.FALSE` if x is `()`
         *  - `Bool.FALSE` if x is and `Undefined` item
         *  - `Bool.FALSE` if x is a tuple containing only items that booleanize to `Bool.FALSE`
         *  - `Bool.TRUE` in any other case
         */
        __apply__ (...values) {
            return new types.Tuple(...values).toBoolean();
        },
        
        /**
         *  `Bool.not: Term x -> Bool b`
         *  ----------------------------------------------------------------------------
         *  Given a swan term `x`, the `Bool.not` function returns: 
         *  
         *  - `Bool.FALSE` if `Bool x` returns `Bool.TRUE`
         *  - `Bool.TRUE` if `Bool x` returns `Bool.FALSE`
         */
        not (...values) {
            return !(new types.Tuple(...values).toBoolean());
        },
    
        /**
         *  `Bool.TRUE: Bool`
         *  ----------------------------------------------------------------------------
         *  This constant represent the boolean true value in swan.
         */
        TRUE: true,
        
        
        /**
        *  `Bool.FALSE: Bool`
        *  ----------------------------------------------------------------------------
         *  This constant represent the boolean false value in swan.
         */
        FALSE: false
    },
    
    
    Numb: {
        
        /**
         *  `Numb.parse: Text s -> Numb n`
         *  ------------------------------------------------------------------------
         *  Converts a string to a number. It accepts also binary (0b...), octal
         *  (0o...) and exadecimal (0x...) string representations of numbers.
         *  
         *  If the argument is not a valid string, this function returns Undefined Number.
         *  If the argument is a tuple, only the first item will be considered.
         */
        parse (value) {
            return isText(value) ? Number(value) : NaN;
        },
        
        /**
         *  `Numb.tuple: Numb n -> Numb Tuple r`
         *  ----------------------------------------------------------------------------
         *  Given a number `n`, this function returns the tuple of integers
         *  (0, 1, 2, ..., m), where m is the highest integer lower than m.
         *  
         *  For example:
         *  - `Numb.tuple 4` returns `(0,1,2,3)`
         *  - `Numb.tuple 5.1` return `(0,1,2,3,4,5)`
         *  
         *  If `n` is not a number, this function returns Undefined Tuple.
         *  If `n` is a tuple, only its first item will be considered.
         */
        tuple (n) {
            if (types.wrap(n) instanceof types.Numb) {
                let tuple = new types.Tuple();
                for (let i=0; i<n; i++) {
                    tuple = new types.Tuple(tuple, i);
                }
                return tuple;
            } else {
                return new types.Undefined("Tuple");
            }
        }
    },
    
    
    Text: {

        /**
         *  `Text: Term X -> Text s`
         *  ------------------------------------------------------------------------
         *  The `Text` callable takes any term `X` as argument and converts it 
         *  into a Text item according to the following rules:
         *
         *  - if `X` is a `Bool` item it either returns `"TRUE"` or `"FALSE"`
         *  - if `X` is a `Numb` item it returns the number as a string
         *  - if `X` is a `Text` item it teturns `X`
         *  - if `X` is a `List` item it returns `"[[List of <n> items]]"` where 
         *    `<n>` is the size of `X`
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
        __apply__ (...values) {
            const term = new types.Tuple(...values);
            const textTuple = term.imapSync((item) => {
                if (item instanceof types.Namespace) {
                    const __text__ = item.apply("__text__");
                    if (__text__ instanceof types.Text) return __text__;
                }
                return item;
            });
            return textTuple.toString();
        },
        
        
        /**
         *  `Text.size: Text s -> Numb n`
         *  ------------------------------------------------------------------------
         *  Returns the number of characters in a Text item or `Undefined Number`
         *  if the argumen is not a Text item. If the argument is a tuple, it 
         *  applies only to its first item.
         */
        size (x) {
            const X = types.wrap(x);
            return X instanceof types.Text ? X.size : NaN;
        },
        
        
        /**
         *  `Text.enum: Text s -> Tuple c`
         *  ------------------------------------------------------------------------
         *  Returns the tuple of characters in a Text item or `Undefined Term`
         *  if the argumen is not a Text item. If the argument is a tuple, it 
         *  applies only to its first item.
         */
        enum (x) {
            const X = types.wrap(x);
            return X instanceof types.Text ? new types.Tuple(...X.image) : new Undefined("Term");
        },


        /**
         *  `Text.find: Text s -> Text S -> Numb k`
         *  ------------------------------------------------------------------------
         *  Takes a string `s` as argument and returns a function `f`. 
         *  If the argument is a tuple, it applies only to its first item.
         *  
         *  The returned function `f`: 
         *  - takes a string `S` as argument and returns the first position of `s` 
         *    in `S` or `-1` if `s` is not contained in `S`.
         *  - returns Undefined Number if the argument of `f` is not a Text item
         *  - applies only on the first item if the parameter of `f` is a tuple
         */
        find: s1 => s2 => isText(s1) && isText(s2) ? s2.indexOf(s1) : NaN,


        /**
         *  `Text.rfind: Text s -> Text S -> Numb k`
         *  ------------------------------------------------------------------------
         *  Takes a string `s` as argument and returns a function `f`.
         *  If the argument is a tuple, it applies only to its first item.
         *  
         *  The returned function `f`: 
         *  - takes a string `S` as argument and returns the last position of `s` 
         *    in `S` or `-1` if `s` is not contained in `S`.
         *  - returns Undefined Number if the argument of `f` is not a Text item
         *  - applies only on the first item if the parameter of `f` is a tuple
         */
        rfind: s1 => s2 => isText(s1) && isText(s2) ? s2.lastIndexOf(s1) : NaN,
        

        /**
         *  `Text.lower: Text S -> Text s`
         *  ------------------------------------------------------------------------
         *  Returns the passed string in lower-case or `Undefined Text` if the
         *  argument is not a Text item. If the argument is a tuple, this 
         *  function applies to its first item only.
         */
        lower: str => isText(str) ? str.toLowerCase() : undefined_text,
        

        /**
         *  `Text.upper: Text s -> Text S`
         *  ------------------------------------------------------------------------
         *  Returns the passed string in upper-case or `Undefined Text` if the
         *  argument is not a Text item. If the argument is a tuple, this 
         *  function applies to its first item only.
         */
        upper: str => isText(str) ? str.toUpperCase() : undefined_text,
        
        
        /**
         *  `Text.trim: Text S -> Text s`
         *  ------------------------------------------------------------------------
         *  Removed the leading and trailing spaces from the given string.
         *  If the argument is not a Text item, this functions return Undefined Text.
         *  If the parameter is a tuple, this function applies to its first item only.
         */
        trim: s => isText(s) ? s.trim() : undefined_text,


        /**
         *  `Text.trim_head: Text S -> Text s`
         *  ------------------------------------------------------------------------
         *  Removed the leading spaces from the given string.
         *  If the argument is not a Text item, this functions return Undefined Text.
         *  If the parameter is a tuple, this function applies to its first item only.
         */
        trim_head: s => isText(s) ? s.trimStart() : undefined_text,


        /**
         *  `Text.trim_tail: Text S -> Text s`
         *  ------------------------------------------------------------------------
         *  Removed the trailing spaces from the given string.
         *  If the argument is not a Text item, this functions return Undefined Text.
         *  If the parameter is a tuple, this function applies to its first item only.
         */
        trim_tail: s => isText(s) ? s.trimEnd() : undefined_text,
        

        /**
         *  `Text.head: Numb n -> Text S -> Text s`
         *  ------------------------------------------------------------------------
         *  Takes a number `n` as argument and returns a function `f`.
         *  If the argument is a tuple, it applies only to its first item.
         *  
         *  The returned function `f`: 
         *  - takes a string `s` as argument and returns the substring at the 
         *    left-side of the n-th character. If n is negative, the character 
         *    position is computed as relative to the end of `L`.
         *  - returns Undefined Text if the argument of `f` is not a Text item
         *  - applies only on the first item if the parameter of `f` is a tuple
         */
        head: n => s => isNumb(n) && isText(s) ? s.slice(0,n) : undefined_text,
        

        /**
         *  `Text.tail: Numb n -> Text S -> Text s`
         *  ------------------------------------------------------------------------
         *  Takes a number `n` as argument and returns a function `f`.
         *  If the argument is a tuple, it applies only to its first item.
         *  
         *  The returned function `f`: 
         *  - takes a string `s` as argument and returns the substring at the 
         *    right-side of the n-th character (including the latter). If n is 
         *    negative, the character position is computed as relative to the 
         *    end of `S`.
         *  - returns Undefined Text if the argument of `f` is not a Text item
         *  - applies only on the first item if the parameter of `f` is a tuple
         */
        tail: n => s => isNumb(n) && isText(s) ? s.slice(n) : undefined_text,


        /**
         *  `Text.split: Text s -> Text S -> List l`
         *  ------------------------------------------------------------------------
         *  Takes a string `s` as argument and returns a function `f`.
         *  If the argument is a tuple, it applies only to its first item.
         *  
         *  The returned function `f`: 
         *  - takes a string `S` as argument and returns the tuple of substrings 
         *    separated by s. For example, if the divider is `s=":"` and the string 
         *    is `S="a:b:c"`, the function `f` returns `("a","b","c")`.
         *  - returns Undefined Text if the argument of `f` is not a Text item
         *  - applies only on the first item if the parameter of `f` is a tuple
         */
        split: s1 => s2 => isText(s1) && isText(s2) ? 
                new types.Tuple(...s2.split(s1)).normalize() : 
                undefined_text,     
        
        /**
         *  `Text.join: Text s -> Tuple T -> Text S`
         *  ------------------------------------------------------------------------
         *  Takes a separator `s` as argument and returns a function `f`.
         *  If the argument is a tuple, it applies only to its first item.
         *  
         *  The returned function `f` takes a Tuple `T` of Text items as 
         *  argument and returns the string obtained by joining all the items 
         *  with interposed  sparator.
         */
        join: separator => (...items) => {
            if (!isText(separator)) return undefined_text;
            const tuple = new types.Tuple(...items);
            const textTuple = tuple.imapSync(item => item.toString());
            return Array.from(textTuple).join(separator);
        }                        
    },
    
    
    List: {

        /**
         *  `List.size: List l -> Numb n`
         *  ------------------------------------------------------------------------
         *  Returns the number of items contained in a List item or `Undefined Number`
         *  if the argument is not a List item. If the argument is a tuple, it 
         *  applies only to its first item.
         */
        size (x) {
            const X = types.wrap(x);
            return X instanceof types.List ? X.size : NaN;
        },
        
        
        /**
         *  `List.enum: List L -> Tuple items`
         *  ------------------------------------------------------------------------
         *  Returns the tuple of items in a List item or `Undefined Term`
         *  if the argumen is not a List item. If the argument is a tuple, it 
         *  applies only to its first item.
         */
        enum (x) {
            const X = types.wrap(x);
            return X instanceof types.List ? new types.Tuple(...X.image) : new Undefined("Term");
        },


        /**
         *  `List.reverse: List l1 -> List l2`
         *  ------------------------------------------------------------------------
         *  Given a list l1, returns a new list l2, containing the items of l1 in
         *  reversed order.
         *  If the argument is not a List item, this function returns Undefined List.
         *  If the parameter is a tuple, this function applies only to the first
         *  item and ignores the others.
         */
        reverse: L => {
            if (isList(L)) {
                const rlist = [];
                for (let i=L.length-1; i>=0; i--) rlist.push(L[i]);
                return rlist;
            } else {
                return undefined_list;
            }
        },

        
        /**
         *  `List.find: Item x -> List L -> Numb k`
         *  ------------------------------------------------------------------------
         *  Takes an item `x` as argument and returns a function `f`. If the 
         *  argument is a tuple, it applies only to its first item.
         *  
         *  The returned function `f`: 
         *  - takes a list `L` as argument and returns the first position of `x` in 
         *    `L` or `-1` if `x` is not contained in `L`.
         *  - returns Undefined List if the argument of `f` is not a List item
         *  - applies only on the first item if the parameter of `f` is a tuple
         */
        find: x => L => isList(L) ? L.indexOf(x) : NaN,
        

        /**
        *  `List.rfind: Item x -> List L -> Numb k`
        *  ------------------------------------------------------------------------
        *  Takes an item `x` as argument and returns a function `f`. 
        *  If the argument is a tuple, it applies only to its first item.
        *  
        *  The returned function `f`: 
        *  - takes a list `L` as argument and returns the last position of `x` in 
        *    `L` or `-1` if `x` is not contained in `L`.
        *  - returns Undefined List if the argument of `f` is not a List item
        *  - applies only on the first item if the parameter of `f` is a tuple
         */
        rfind: x => L => isList(L) ? L.lastIndexOf(x) : NaN,
        

        /**
         *  `List.head: Numb n -> List L -> List l`
         *  ------------------------------------------------------------------------
         *  Takes a number `n` as argument and returns a function `f`. 
         *  If the argument is a tuple, it applies only to its first item.
         *  
         *  The returned function `f`: 
         *  - takes a list `L` as argument and returns the sub-list at the left-side 
         *    of the n-th item. If n is negative, the item position is computed as 
         *    relative to the end of `L`.     
         *  - returns Undefined List if the argument of `f` is not a List item
         *  - applies only on the first item if the parameter of `f` is a tuple
         */
        head: n => L => isNumb(n) && isList(L) ? L.slice(0,n) : undefined_list,

        /**
         *  `List.tail: Numb n -> List L -> List l`
         *  ------------------------------------------------------------------------
         *  Takes a number `n` as argument and returns a function `f`. 
         *  If the argument is a tuple, it applies only to its first item.
         *  
         *  The returned function `f`: 
         *  - takes a list `L` as argument and returns the sub-list at the 
         *    right-side of the n-th item (including the latter). If n is negative, 
         *    the item position is computed as relative to the end of `L`.     
         *  - returns Undefined List if the argument of `f` is not a List item
         *  - applies only on the first item if the parameter of `f` is a tuple
         */
        tail: n => L => isNumb(n) && isList(L) ? L.slice(n) : undefined_list
    },
    
    
    Namespace: {
        
        /**
         *  `Namespace.names: Namespace ns -> Tuple t`
         *  ------------------------------------------------------------------------
         *  Returns the tuple of nams contained in a given Namespace item or
         *  `Undefined Term` if the argument is not a Namespace item. If the 
         *  argument is a tuple, it applies only to its first item.
         */
        names (x) {
            const X = types.wrap(x);
            return X instanceof types.Namespace ? new types.Tuple(...X.domain) : new Undefined("Term");
        },
        
        
        enum (x) {
            const X = types.wrap(x);
            return X instanceof types.Namespace ? new types.Tuple(...X.image) : new Undefined("Term");
        },



        /**
         *  `Namespace.size: Namespace ns -> Numb n`
         *  --------------------------------------------------------------------
         *  Returns the number of items contained in a Namespace item or
         *  `Undefined Number` if the argument is not a Namespace item. If the 
         *  argument is a tuple, it applies only to its first item.
         */
        size (x) {
            const X = types.wrap(x);
            return X instanceof types.Namespace ? X.size : NaN;
        },


        /**
         *  `Namespace.parent: Namespace x -> Namespace p`
         *  ------------------------------------------------------------------------
         *  Given a Namespace `x`, returns its parent namespace or `Undefined Namespace` 
         *  if the `x` has no parent or if `x` is not a Namespace item. If `x` 
         *  is a tuple, it applies only to its first item.
         */
        parent (x) {
            const X = types.wrap(x);
            if (X instanceof types.Namespace) {
                const parent = X.vmapSync(Object.getPrototypeOf);
                if (parent instanceof types.Namespace) return parent;
            }
            return new types.Undefined('Namespace');
        },


        /**
         *  `Namespace.own: Namespace x -> Namespace o`
         *  ------------------------------------------------------------------------
         *  Given a namespace `x`, returns a copy of its own names, enclosed in a 
         *  parent-less namespace. It returns Undefined Namespace if `x` is not 
         *  a namespace. If `x` is a tuple, it applies only to its first item.
         */
        own (x) {
            const X = types.wrap(x);
            if (X instanceof types.Namespace) {
                return X.vmapSync(ns => Object.assign(Object.create(null), ns));
            } else {
                return new types.Undefined('Namespace');
            }
        }
    },
    
    
    Func: {
        
        /**
         *  `Func.ID: Term t -> Term t`
         *  --------------------------------------------------------------------
         *  Takes any term and returns it unchanged.
         */
        ID: (...values) => new types.Tuple(...values)
    },
    
    
    Undefined: {
        
        /**
         *  `Undefined: (Text t, Tuple a) -> Undefined u`
         *  ----------------------------------------------------------------------------
         *  This function returns an `Undefined` item with type `t` and arguments `a`.
         */
        __apply__ (type, ...args) {
            return new types.Undefined(type, ...args);
        },      

        /**
         *  `Undefined.type: Undefined u -> Text t`
         *  --------------------------------------------------------------------
         *  Given an undefined item, it returns its type as Text or `Undefined Text`
         *  if `u` is not an Undefined item.
         */
        type: u => isUndefined(u) ? u.type : new types.Undefined('Undefined', u),

        /**
         *  `Undefined.args: Undefined u -> Tuple t`
         *  --------------------------------------------------------------------
         *  Given an undefined item, it returns its arguments Tuple or
         *  `Undefined Term` if `u` is not an Undefined item.
         */
        args: u => isUndefined(u) ? 
                new types.Tuple(...u.args) : 
                new types.Undefined('Term', u) ,
    }
}
