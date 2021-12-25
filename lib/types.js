const {matchIdentifier} = require("./lexer");


class Term {
    
    get typeName () {
        return this.constructor.name;
    }
    
    *items () {}
    
    *values () {
        for (let item of this.items()) yield unwrap(item);
    }
    
    *[Symbol.iterator] () {
        for (let value of this.values()) yield value;
    }

    toVoid () {
        return null;
    }   

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
}


class Item extends Term {
    
    constructor (value) {
        super();
        this._value = value;
    }
    
    *items () {
        yield this;
    }
    
    unwrap () {
        return this._value;
    }
    
    imapSync (f) {
        return wrap( f(this) );
    }
    
    async imapAsync (f) {
        return wrap( await f(this) );
    }
    
    vmapSync (f) {
        return wrap( f( unwrap(this) ) );
    }
    
    async vmapAsync (f) {
        return wrap( await f( unwrap(this) ) );
    }
    
    toBoolean () {
        return true;
    }    
    
    toString () {
        return `[[${this.typeName}]]`;
    }
    
    isNothing () {
        return false;
    }
    
    normalize () {
        return this;
    }
    
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
    // can items and/or tuples. The iterator function will take care of flattening
    // the tuple, so that `new TupleObject(a, new TupleObject(b, c))` is
    // equivalent to `new TupleObject(a, b, c)`.
    constructor (...items) {
        super();
        this._items = items.map(wrap);
    }
    
    *items () {
        for (let item of this._items) {
            for (let subItem of item.items()) yield subItem;
        }        
    }
            
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
    
    isNothing () {
        let iterator = this.items();
        return iterator.next().done;
    } 
    
    imapSync (f) {
        const values = Array.from( this.items() ).map(f);
        return new this.constructor(...values.map(wrap));
    }
    
    async imapAsync (f) {
        const values = await Promise.all(Array.from( this.items() ).map(f));
        return new this.constructor(...values.map(wrap));
    }
    
    vmapSync (f) {
        const values = Array.from( this.values() ).map(f);
        return new this.constructor(...values.map(wrap));
    }
    
    async vmapAsync (f) {
        const values = await Promise.all(Array.from( this.values() ).map(f));
        return new this.constructor(...values.map(wrap));
    }
    
    toBoolean () {
        for (let item of this.items()) {
            if (item.toBoolean()) return true;
        }
        return false;
    }
    
    toString () {
        let text = "";
        for (let item of this.items()) {
            text += item.toString();
        }
        return text;
    }

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


class Undefined extends Item {
    
    constructor (type, ...args) {
        super({
            type: type, 
            args: args.map(unwrap)
        });
    }
    
    get type () {
        return super.unwrap().type;
    }
    
    get args () {
        return super.unwrap().args;
    }
    
    unwrap () {
        return this;
    }
    
    toBoolean () {
        return false;
    }
    
    toString () {
        return `[[Undefined ${this.type}]]`;
    }
    
    // ALGEBRA
    
    // sum (other) { Sum operation not defined }
    // negate () { Additive inverse not defined }
    // isNull () { Additive neutral element not defined }    
    // static get null () { Additive neutral element not defined }
    
    // mul (other) { Product operation not defined }
    // invert () { Multiplicative inverse not defined }
    // isUnit () { Multiplicative neutral element not defined }
    // static get unit () { Multiplicative neutral element not defined }
}


class Bool extends Item {
    
    toBoolean () {
        return this.unwrap();
    }
    
    toVoid () {
        return false;
    }
    
    toString () {
        return this.unwrap() ? "TRUE" : "FALSE";
    }
    
    // ALGEBRA
    
    sum (other) {
        return new this.constructor(this.unwrap() || other.unwrap());
    }
    
    // negate () { Additive inverse not defined }
    
    isNull () {
        return !this.unwrap();
    }
    
    static get null () {
        return new this(false);
    }
    
    mul (other) {
        return new this.constructor(this.unwrap() && other.unwrap());
    }
    
    // invert () { Multiplicative inverse not defined }

    isUnit () {
        return this.unwrap();
    }
    
    static get unit () {
        return new this(true);
    }

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
    
    toBoolean () {
        return this.unwrap() !== 0;
    }
    
    toVoid () {
        return 0;
    }
    
    toString () {
        return String( this.unwrap() );
    }
    
    // ALGEBRA
    
    sum (other) {
        return new this.constructor(this.unwrap() + other.unwrap());
    }
    
    negate () {
        return new this.constructor(-this.unwrap());
    }
    
    isNull () {
        return this.unwrap() === 0;
    }
    
    static get null () {
        return new this(0);
    }
    
    mul (other) {
        return new this.constructor(this.unwrap() * other.unwrap());
    }
    
    invert () {
        return new this.constructor(1 / this.unwrap());
    }
    
    isUnit () {
        return this.unwrap() === 1;
    }
    
    static get unit () {
        return new this(1);
    }
    
    compare (other) {
        return super.compare(other, (thisValue, otherValue) => {
            return thisValue === otherValue ? '=' : (thisValue < otherValue ? '<' : '>');
        });
    }
}


class Func extends Item {
    
    async apply (...items) {
        return await this.unwrap()(...items.map(unwrap));
    }
}


class Mapping extends Item {
    

    // Core interface
    
    get domain () {
        // This should return an array of all the possible x values that this
        // mapping maps
    }
    
    f (x) {
        // This should return the value that this mapping maps to x
        // It should always return a defined value if x is part of the domain
        // It should always return `undefined` if x is not part of the domain 
    }
    
    
    // Derived interface
    
    get size () {
        return this.domain.length;
    }
    
    get image () {
        return this.domain.map(x => this.f(x));
    }
    
    apply (...X) {
        const Y = X.map(x => {
            const y = this.f(x);
            return y === undefined ? new Undefined("Mapping", x) : wrap(y);
        });
        return Y.length === 1 ? Y[0] : new Tuple(...Y);
    }
    
    toBoolean () {
        return this.size > 0;
    }    
}


class Sequence extends Mapping {
    
    get size () {
        return this.unwrap().length;
    }
    
    get domain () {
        return Object.keys(this.unwrap()).map(Number);
    }
    
    f (i) {
        return typeof i === 'number' ? this.unwrap()[i] : undefined;
    }    
}


class Text extends Sequence {
    
    toVoid () {
        return "";
    }
    
    toString () {
        return this.unwrap();
    }
    
    // ALGEBRA
    
    sum (other) {
        return new this.constructor(this.unwrap() + other.unwrap());
    }
    
    // negate () { Additive inverse not defined }
    
    isNull () { 
        return this.size === 0;
    }
    
    static get null () {
        return new this("");
    }
    
    // mul (other) { Product operation not defined }
    
    // invert () { Multiplicative inverse not defined }
    
    // isUnit () { Multiplicative neutral element not defined }
    
    // static get unit () { Multiplicative neutral element not defined }
    
    compare (other) {
        return super.compare(other, (thisString, otherString) => {
            const cmp = thisString.localeCompare(otherString);
            return cmp === 0 ? '=' : (cmp === -1 ? '<' : '>');
        });
    }
}


class List extends Sequence {
    
    toVoid () {
        return [];
    }
    
    toString () {
        const n = this.size;
        return n === 1 ? "[[List of 1 item]]" : `[[List of ${n} items]]`;
    }
    
    static fromTerm (term) {
        return new this(Array.from(term).map(unwrap));
    }
    
    // ALGEBRA
    
    sum (other) {
        return new this.constructor( this.unwrap().concat(other.unwrap()) );
    }
    
    // negate () { Additive inverse not defined }
    
    isNull () { 
        return this.size === 0;
    }
    
    static get null () {
        return new this([]);
    }
    
    // mul (other) { Product operation not defined }
    
    // invert () { Multiplicative inverse not defined }
    
    // isUnit () { Multiplicative neutral element not defined }
    
    // static get unit () { Multiplicative neutral element not defined }   
    
    compare (other) {
        return super.compare(other, (thisArray, otherArray) => {
            const thisTuple  = new Tuple(...thisArray);
            const otherTuple = new Tuple(...otherArray);
            return thisTuple.compare(otherTuple);
        });
    } 
}


class Namespace extends Mapping {

    get domain () {
        const keys = [];
        for (let key in this.unwrap()) {
            if (matchIdentifier(key)) keys.push(key);
        }
        return keys;
    }
    
    f (key) {
        if (matchIdentifier(key)) {
            const value = this.unwrap()[key];
            if (Object.prototype[key] !== value) return value;            
        }
    }
    
    assign (term1, term2) {
        const names = Array.from(term1).map(unwrap);
        const values = Array.from(term2).map(unwrap);
        
        if (values.length > names.length) {
            values[names.length-1] = new Tuple(...values.slice(names.length-1));
        }
        
        const object = this.unwrap();
        for (let i=0; i<names.length; i++) {
            object[ names[i] ] = i < values.length ? unwrap(values[i]) : null;
        }
    }
    
    toVoid () {
        return {}
    }
    
    toString () {
        
        return "{" + this.domain.join(", ") + "}";
    }

    // ALGEBRA
    
    sum (other) {
        return new this.constructor( Object.assign({}, this.unwrap(), other.unwrap()) );
    }
    
    // negate () { Additive inverse not defined }
    
    isNull () { 
        return this.size === 0;
    }
    
    static get null () {
        return new this({});
    }
    
    // mul (other) { Product operation not defined }
    
    // invert () { Multiplicative inverse not defined }
    
    // isUnit () { Multiplicative neutral element not defined }
    
    // static get unit () { Multiplicative neutral element not defined }
    
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
                case '[object Boolean]'  : return new Bool(value);
                case '[object Number]'   : return new Numb(value);
                case '[object String]'   : return new Text(value);
                case '[object Function]' : return new Func(value);
            }
            
            return new Namespace(value);
    }
}

function unwrap (term) {
    return (term instanceof Term) ? term.unwrap() : term;
}


module.exports = {
    Term,
        Tuple,
        Item,
            Bool, 
            Numb, 
            Func, 
            Undefined, 
            Mapping, 
                Sequence, 
                    Text, 
                    List, 
                Namespace,
                
    wrap, unwrap
};




