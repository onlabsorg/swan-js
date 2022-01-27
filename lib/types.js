// =============================================================================
//  This module contains the Swan data types.
//  
//  The most generic data type is a `Term`: everything is a Term in swan. There
//  are two type of Terms:
//
//  - `Item` is either Bool, Numb, Text, List, Namespace, Func or Undefined.
//  - `Tuple` is the swan product type (a sequence of items)
//  
//  Each Item behaves also as a Tuple of one element and every tuple made of 
//  only one element behaves like an Item.
//  
//  An empty Tuple represents nothingness.
//
//  Each Term wraps a javascript object (the term `value`) and exposes a standard
//  interface to interact with it. The term interface is documented below
//  inside the Term class definition.
// =============================================================================

const {matchIdentifier} = require("./lexer");


class Term {
    
    // ###  TUPLE ITERATORS  ###################################################
    
    // This methods iterates over the tuple items. If the term is an Item, it
    // will yield the item itself.
    *items () {}
    
    // This method iterates over the tuple item values (the javascript wrapped
    // objects). If the term is an Iterm, it will yield a single value.
    *values () {
        for (let item of this.items()) yield unwrap(item);
    }
    
    // When iterating over a term, it yields the tuple item values.
    *[Symbol.iterator] () {
        for (let value of this.values()) yield value;
    }

    // Given two terms, it pairs their corresponding iterm and yields them as
    // a pair. For example (item11, item12, item13) paired with (item21, item22,
    // item23) yields [item11, item21], [item12, item22], [item13, item23].
    *iterPairs (other) {
        const iterator1 = this.items();
        const iterator2 = other.items();
        while (true) {
            let iterItem1 = iterator1.next();
            let iterItem2 = iterator2.next();
            if (iterItem1.done && iterItem2.done) break;
            yield [wrap(iterItem1.value), wrap(iterItem2.value)];
        }        
    }


    // ###  TUPLE MAPPING  #####################################################
    
    // Maps each item via the synchronous function fn
    imapSync (fn) {}
    
    // Maps each value via the synchronous function fn
    vmapSync (fn) {}
    
    // Maps each item via the asynchronous function fn
    async imapAsync (fn) {}
    
    // Maps each value via the asynchronous function fn
    async vmapAsync (fn) {}    


    // ###  TYPE CASTING  ######################################################

    // Converts this term to a JavaScript Boolean
    toBoolean () {}    

    // Converts this term to a JavaScript String
    toString () {}    
    
    
    // ###  MISCELLANEOUS METHODS  #############################################

    // Class name
    get typeName () {
        return this.constructor.name;
    }
    
    // Returns true if this term is an empty tuple
    isNothing () {}
    
    // Coverts a tuple containing only one item to an item. In any other case,
    // returns this term as it is.
    normalize () {}
    
    // Returns the JavaScript value wrapped in this term
    unwrap () {}
    

    // ###  ALGEBRA  ###########################################################
    // The following methods define the agebraic behavior of this term. Not all 
    // terms define all the algebraic methods. The method not being defined
    // means that the corresponding operation is not defined.
    
    // Internal sum operation
    // sum (other) {}   

    // Additive inverse
    // negate () {}
    
    // Additive neutral element check
    // isNull () {}    
    
    // Additive neutral element
    // static get null () {}
    
    // Internal product operation
    // mul (other) {}
    
    // Multiplicative inverse
    // invert () {}
    
    // Multiplicative neutral element check
    // isUnit () {}
    
    // Multiplicative neutral element
    // static get unit () {}
    
    // Power operation
    // pow (other) {}
    
    // Compare this term with another term and it returns
    // "=" if the two terms are equal
    // ">" if this term is greather than the other term
    // "<" if this term is less than the other term
    // "#" if no order is defined for this term but the two terms are not equal
    // compare (other) {}
}


class Item extends Term {
    
    constructor (value) {
        super();
        this.$value = value;
    }

    
    // ###  TUPLE ITERATORS  ###################################################

    // Yields this item as if it was a tuple made of one item only.
    *items () {
        yield this;
    }

    
    // ###  TUPLE MAPPING  #####################################################

    // Maps this item as if it was a tuple made of one item only.
    imapSync (f) {
        return wrap( f(this) );
    }
    
    // Maps this item value as if it was a tuple made of one item only.
    vmapSync (f) {
        return wrap( f( unwrap(this) ) );
    }
    
    // Maps this item as if it was a tuple made of one item only.
    async imapAsync (f) {
        return wrap( await f(this) );
    }
    
    // Maps this item value as if it was a tuple made of one item only.
    async vmapAsync (f) {
        return wrap( await f( unwrap(this) ) );
    }

    
    // ###  TYPE CASTING  ######################################################

    // By default, an item is always true.
    toBoolean () {
        return true;
    }    
    
    // By default, an item stringifies to the type name between `[[` and `]]`.
    toString () {
        return `[[${this.typeName}]]`;
    }
    
    
    // ###  MISCELLANEOUS METHODS  #############################################

    // An item is never an empty tuple
    isNothing () {
        return false;
    }
    
    // An item is already in its normalized form
    normalize () {
        return this;
    }
    
    // By default, it returns the argument passed to the constructor
    unwrap () {
        return this.$value;
    }

    
    // ###  ALGEBRA  ###########################################################
    
    // This compare method is generally used by specific Items. It takes care 
    // of some common boilerplate and delegates the actual comparison to the
    // function passed as second parameters.
    // If called directly without the second parameter, it performs a
    // JavaScript `===` comparison and returns either `=` or `#`.
    // It also makes sure that Nothing is lower than anything elese.
    compare (other, _compareSameTypeValues) {
        if (other instanceof this.constructor) {
            if (typeof _compareSameTypeValues === 'function') {
                return _compareSameTypeValues(this.unwrap(), other.unwrap());
            } else {
                return this.unwrap() === other.unwrap() ? '=' : '#';                
            }
        } else {
            return other.isNothing() ? '>' : '#';
        }
    }
}


class Tuple extends Term {
    
    // Creates an Tuple instance given a sequence of values. The passed values
    // can be items and/or tuples. The iterator function will take care of flattening
    // the tuple, so that `new Tuple(a, new TupleObject(b, c))` is
    // equivalent to `new TupleObject(a, b, c)`.
    constructor (...items) {
        super();
        this._items = items.map(wrap);
    }
    

    // ###  TUPLE ITERATORS  ###################################################

    // Yields all the items of this tuple, flattening nested tuples.
    *items () {
        for (let item of this._items) {
            for (let subItem of item.items()) yield subItem;
        }        
    }
    
        
    // ###  TUPLE MAPPING  #####################################################

    // Maps each item of this tuple through the passed synchronous function 
    // and returns a new tuple.
    imapSync (f) {
        const values = Array.from( this.items() ).map(f);
        return new this.constructor(...values.map(wrap));
    }
    
    // Maps each item value of this tuple through the passed synchronous 
    // function and returns a new tuple.
    vmapSync (f) {
        const values = Array.from( this.values() ).map(f);
        return new this.constructor(...values.map(wrap));
    }
    
    // Maps each item of this tuple through the passed asynchronous function 
    // and returns a new tuple.
    async imapAsync (f) {
        const values = await Promise.all(Array.from( this.items() ).map(f));
        return new this.constructor(...values.map(wrap));
    }
    
    // Maps each item value of this tuple through the passed asynchronous 
    // function and returns a new tuple.
    async vmapAsync (f) {
        const values = await Promise.all(Array.from( this.values() ).map(f));
        return new this.constructor(...values.map(wrap));
    }


    // ###  TYPE CASTING  ######################################################

    // A tuple booleanizes to false only if all its items booleanize to false.
    toBoolean () {
        for (let item of this.items()) {
            if (item.toBoolean()) return true;
        }
        return false;
    }
    
    // A tuple serializes to the concatenation of all the serialized items
    toString () {
        let text = "";
        for (let item of this.items()) {
            text += item.toString();
        }
        return text;
    }


    // ###  MISCELLANEOUS METHODS  #############################################

    // A tuple is nothing if it contains no items.
    isNothing () {
        let iterator = this.items();
        return iterator.next().done;
    } 
    
    // A tuple normalizes to itself if it contains none or more than one item.
    // If it contains only one item, it normalizes to that item.
    normalize () {
        const iterator = this.items();
        const first = iterator.next();
        
        // If the tuple is empty return null
        if (first.done) return this;
        
        // If the tuple contains only one iterm, return that item
        if (iterator.next().done) return first.value;
        
        // If the tuple contains more than one iterm, return the tuple itself
        return this;
    } 
    
    // A tuple unwraps to itself: there is no equivalent javascript object for
    // a tuple. 
    unwrap () {
        const iterator = this.values();
        const first = iterator.next();
        
        // If the tuple is empty return null
        if (first.done) return null;
        
        // If the tuple contains only one iterm, return that item
        if (iterator.next().done) return first.value;
        
        // If the tuple contains more than one iterm, return the tuple itself
        return this;
    }    
    
    
    // ###  ALGEBRA  ###########################################################
    
    // Tuples are compared lexicographically.
    compare (other) {
        for (let [item1, item2] of this.iterPairs(other)) {
            if (item1.isNothing()) return item2.isNothing() ? '=' : '<';
            if (item2.isNothing()) return '>';
            let cmp = item1.compare(item2);
            if (cmp !== '=') return cmp;
        }
        return '=';
    }
}


class Bool extends Item {
    

    // ###  TYPE CASTING  ######################################################

    // Returns true if this is TRUE
    toBoolean () {
        return this.unwrap();
    }
    
    // Serializes either to "FALSE" or to "TRUE"
    toString () {
        return this.unwrap() ? "TRUE" : "FALSE";
    }
    
    
    // ###  ALGEBRA  ###########################################################
        
    // The sum of two Bool items corresponds to the logic OR
    sum (other) {
        return new this.constructor(this.unwrap() || other.unwrap());
    }
    
    // Additive inverse not defined
    // negate () {}
    
    // Returns true if this is FALSE
    isNull () {
        return !this.unwrap();
    }
    
    // The Additive neutral element is FALSE
    static get null () {
        return new this(false);
    }
    
    // The product of two Bool items corresponds to the logic AND
    mul (other) {
        return new this.constructor(this.unwrap() && other.unwrap());
    }
    
    // Multiplicative inverse not defined
    // invert () {}

    // Returns true if this is TRUE
    isUnit () {
        return this.unwrap();
    }
    
    // The Multiplicative neutral element is TRUE
    static get unit () {
        return new this(true);
    }

    // Exponentiation operation not defined
    // pow (other) {}

    // FALSE is less than TRUE
    compare (other) {
        return super.compare(other, (thisIsTrue, otherIsTrue) => {
            const thisIsFalse  = !thisIsTrue;
            const otherIsFalse = !otherIsTrue;            
            if (thisIsFalse && otherIsTrue) return '<';
            if (thisIsTrue && otherIsFalse) return '>';
            return '=';
        })
    }
}


class Numb extends Item {
    
    // ###  TYPE CASTING  ######################################################

    // Returns false if 0, or else true
    toBoolean () {
        return this.unwrap() !== 0;
    }
    
    // Returns the number as a string
    toString () {
        return String( this.unwrap() );
    }
    
    
    // ###  ALGEBRA  ###########################################################

    // Real numbers sum
    sum (other) {
        return new this.constructor(this.unwrap() + other.unwrap());
    }
    
    // Real numbers negation
    negate () {
        return new this.constructor(-this.unwrap());
    }
    
    // True if the number is 0
    isNull () {
        return this.unwrap() === 0;
    }
    
    // 0
    static get null () {
        return new this(0);
    }
    
    // Real numbers product
    mul (other) {
        return new this.constructor(this.unwrap() * other.unwrap());
    }
    
    // Real numbers inverse (1/x)
    invert () {
        return new this.constructor(1 / this.unwrap());
    }
    
    // True if the number is 1
    isUnit () {
        return this.unwrap() === 1;
    }
    
    // 1
    static get unit () {
        return new this(1);
    }
    
    // Real numbers power
    pow (other) {
        return new this.constructor(this.unwrap() ** other.unwrap());
    }
    
    // Real numbers comparison
    compare (other) {
        return super.compare(other, (thisValue, otherValue) => {
            return thisValue === otherValue ? '=' : (thisValue < otherValue ? '<' : '>');
        });
    }
}


class Applicable extends Item {    
    // An applicable is any type with an `apply` method.
    // Applicables accept the swan apply operation `X Y`.
}


class Mapping extends Applicable {
    
    // A mapping is an item that maps a set of items (domain of the mapping) to
    // another set of items. For example, a string is a mapping between integer
    // numbers and characters.
    

    // ###  MAPPING-SPECIFIC METHODS  ##########################################

    // This should return an array of all the possible x values that this
    // mapping maps
    get domain () {}
    
    // This should return the value that this mapping maps to x
    // It should always return a defined value if x is part of the domain
    // It should always return `undefined` if x is not part of the domain 
    vget (x) {}

    // This should return the item that this mapping maps to x
    // It should Undefined Mapping if x is not part of the domain 
    iget (x) {
        const value = this.vget(x);
        return value === undefined ? new Undefined("Mapping", x) : wrap(value);
    }

    // The size of a mapping is the number of items in its domain
    get size () {
        return this.domain.length;
    }

    // The image of a mapping is the array of all the mapped values
    get image () {
        return new List(this.domain.map(x => this.vget(x)));
    }
    
    // The apply operation takes a tuple of items and returns the corresponding
    // tuple of mapped items. If an item of the tuple is not part of the domain,
    // the apply operation results in an Undefined item.
    apply (...X) {
        const Y = X.map(x => this.iget(x));
        return Y.length === 1 ? Y[0] : new Tuple(...Y);
    }

    
    // ###  TYPE CASTING  ######################################################

    // A mapping with no pairs (empty mapping) booleanizes to false
    toBoolean () {
        return this.size > 0;
    }    
}


class Sequence extends Mapping {
    
    // A sequence is a special mapping that maps integer numbers to generic
    // items.
    

    // ###  MAPPING-SPECIFIC METHODS  ##########################################

    // Returns the array of integers between 0 and size - 1
    get domain () {
        return Object.keys(this.unwrap()).map(Number);
    }
    
    // Returns the i-th item of the sequence
    vget (i) {
        return typeof i === 'number' ? this.unwrap()[i] : undefined;
    }    

    // More efficient implementation of the size method
    get size () {
        return this.unwrap().length;
    }    
}


class Text extends Sequence {
    
    // ###  TYPE CASTING  ######################################################

    // Returns the Text value
    toString () {
        return this.unwrap();
    }
    
    
    // ###  ALGEBRA  ###########################################################

    // The sum of two Text items is their concatenation
    sum (other) {
        return new this.constructor(this.unwrap() + other.unwrap());
    }
    
    // Additive inverse not defined 
    // negate () {}
    
    // It returns true if the string is empty
    isNull () { 
        return this.size === 0;
    }
    
    // It returns the empty string
    static get null () {
        return new this("");
    }
    
    // Product operation not defined
    // mul (other) {}
    
    // Multiplicative inverse not defined
    // invert () {}
    
    // Multiplicative neutral element not defined
    // isUnit () {}
    
    // Multiplicative neutral element not defined
    // static get unit () {}
    
    // Exponentiation operation not defined
    // pow (other) {}

    // Compare two Text items in alphabetical order
    compare (other) {
        return super.compare(other, (thisString, otherString) => {
            const cmp = thisString.localeCompare(otherString);
            return cmp === 0 ? '=' : (cmp === -1 ? '<' : '>');
        });
    }
}


class List extends Sequence {
    
    // ###  TYPE CASTING  ######################################################

    // Returns "[[List of n terms]]" where n is the list size
    toString () {
        const n = this.size;
        return n === 1 ? "[[List of 1 item]]" : `[[List of ${n} items]]`;
    }
    

    // ###  ALGEBRA  ###########################################################

    // Concatenates the two arrays
    sum (other) {
        return new this.constructor( this.unwrap().concat(other.unwrap()) );
    }
    
    // Additive inverse not defined
    // negate () {}
    
    // Returns true if the list is empty
    isNull () {
        return this.size === 0;
    }
    
    // Returns an empty list
    static get null () {
        return new this([]);
    }
    
    // Product operation not defined
    // mul (other) {}
    
    // Multiplicative inverse not defined
    // invert () {}
    
    // Multiplicative neutral element not defined
    // isUnit () {}
    
    // Multiplicative neutral element not defined
    // static get unit () {}   
    
    // Exponentiation operation not defined
    // pow (other) {}

    // Lexicographical order
    compare (other) {
        return super.compare(other, (thisArray, otherArray) => {
            const thisTuple  = new Tuple(...thisArray);
            const otherTuple = new Tuple(...otherArray);
            return thisTuple.compare(otherTuple);
        });
    } 
}


class Namespace extends Mapping {
    
    // ###  MAPPING-SPECIFIC METHODS  ##########################################

    // Array of object keys which are valid identifiers
    get domain () {
        return Object.keys(this.unwrap()).filter(matchIdentifier);
    }
    
    // Returns the value mapped to the give key
    vget (key) {
        const object = this.unwrap();
        if (matchIdentifier(key) && object.hasOwnProperty(key)) {
            return object[key];
        }
    }

    
    // ###  TYPE CASTING  ######################################################

    // Returns the comma-separated list of keys enclosed between '{' and '}'
    toString () {
        
        return "{" + this.domain.join(", ") + "}";
    }


    // ###  ALGEBRA  ###########################################################

    // Merges two namespaces
    sum (other) {
        const sumObject = Object.assign({}, unwrap(this), unwrap(other));
        return new this.constructor(sumObject);
    }
    
    // Additive inverse not defined
    // negate () {}
    
    // True if the namespace domain is empty
    isNull () { 
        return this.size === 0;
    }
    
    // Returns an empty namespace
    static get null () {
        return new this({});
    }
    
    // Product operation not defined
    // mul (other) {}
    
    // Multiplicative inverse not defined
    // invert () {}
    
    // Multiplicative neutral element not defined
    // isUnit () {}
    
    // Multiplicative neutral element not defined
    // static get unit () {}
    
    // Exponentiation operation not defined
    // pow (other) {}

    // Two namespace are equal if they have same keys and equal values.
    // No order is defined for namespaces: compare returns either '=' or '#'.
    compare (other) {
        return super.compare(other, (thisObject, otherObject) => {
            const thisNames = this.domain;
            const otherNames = other.domain;
            if (thisNames.length !== otherNames.length) return '#';
            for (let name of thisNames) {
                const term1 = this.apply(name);
                const term2 = other.apply(name);
                const cmp = term1.compare(term2);
                if (cmp !== '=') return cmp;
            }
            return '=';
        });        
    }
}


class Func extends Applicable {
    
    // ###  FUNC-SPECIFIC METHODS  #############################################

    // Calls the wrapped function and returns its output wrapped
    async apply (...items) {
        const func = this.unwrap();
        const args = items.map(unwrap);
        return wrap( await func(...args) );
    }
    

    // ###  ALGEBRA  ###########################################################

    // Sum operation not defined
    // sum (other) {}
    
    // Additive inverse not defined
    // negate () {}
    
    // Additive neutral element not defined
    // isNull () {}
    
    // Additive neutral element not defined
    // static get null () {}
    
    // Product operation not defined
    // mul (other) {}
    
    // Multiplicative inverse not defined
    // invert () {}
    
    // Multiplicative neutral element not defined
    // isUnit () {}
    
    // Multiplicative neutral element not defined
    // static get unit () {}
    
    // Exponentiation operation not defined
    // pow (other) {}

    // Default comparison: equal if identical and no order defined
    // compare (other) {}
}


class Undefined extends Item {
    
    // Swan operations do not throw exceptions: they return Undefined instead.
    // For debugging purposes, an Undefined item contains information about the 
    // undefined operation and the operands.
    
    constructor (type, ...args) {
        super({
            type: type, 
            args: args.map(unwrap)
        });
    }
    

    // ###  UNDEFINED-SPECIFIC PROPERTIES  #####################################

    // A string containing the name of the undefined operation
    get type () {
        return super.unwrap().type;
    }
    
    // Array of operands
    get args () {
        return super.unwrap().args;
    }

    
    // ###  TYPE CASTING  ######################################################

    toBoolean () {
        return false;
    }
    
    toString () {
        return `[[Undefined ${this.type}]]`;
    }

    
    // ###  MISCELLANEOUS METHODS  #############################################

    // Unwraps to itself (no equivalent JavaScript type available)
    unwrap () {
        return this;
    }
    
    
    // ###  ALGEBRA  ###########################################################
    
    // Sum operation not defined
    // sum (other) {}
    
    // Additive inverse not defined
    // negate () {}
    
    // Additive neutral element not defined
    // isNull () {}    
    
    // Additive neutral element not defined
    // static get null () {}
    
    // Product operation not defined
    // mul (other) {}
    
    // Multiplicative inverse not defined
    // invert () {}
    
    // Multiplicative neutral element not defined
    // isUnit () {}
    
    // Multiplicative neutral element not defined
    // static get unit () {}
    
    // Exponentiation operation not defined
    // pow (other) {}

    // Default comparison: equal if identical and no order defined
    // compare (other) {}
}


// Takes a javascript value and turns it into the corresponding swan term.
// If the passed value is already wrapped, it returns it as it is.
function wrap (value) {
    
    // if already wrpped
    if (value instanceof Term) return value;
    
    // if not wrapped
    switch (typeof(value)) {
        
        case "undefined":
            return new Tuple();
        
        case "boolean":
            return new Bool(value);
            
        case "number":
            return Number.isNaN(value) ? new Undefined("Number") : new Numb(value);
            
        case "string":
            return new Text(value);
            
        case "function":
            return new Func(value);
            
        // it must be an object
        default:   
        
            // if null
            if (value === null) return new Tuple();
            
            // if an array
            if (Array.isArray(value)) return new List(value);
            
            // if a primitive object
            switch (Object.prototype.toString.call(value)) {
                case '[object Boolean]'  : return new Bool(Boolean(value));
                case '[object Number]'   : return new Numb(Number(value));
                case '[object String]'   : return new Text(String(value));
                case '[object Function]' : return new Func(value);
            }
            
            return new Namespace(value);
    }
}

// Takes a swan term and returns the origina javascript value.
// If the parameter is already unwrapped, it returns it as it is.
function unwrap (term) {
    return (term instanceof Term) ? term.unwrap() : term;
}


module.exports = {
    Term,
        Tuple,
        Item,
            Bool, 
            Numb, 
            Applicable,
                Mapping, 
                    Sequence, 
                        Text, 
                        List, 
                    Namespace,
                Func, 
            Undefined, 
                
    wrap, unwrap
};




