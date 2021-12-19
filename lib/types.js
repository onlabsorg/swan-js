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
}


class Undefined extends Item {
    
    constructor (position, type, value, ...children) {
        super({
            position, 
            type, 
            value: unwrap(value), 
            children: children.map(unwrap)
        });
    }
    
    get position () {
        return super.unwrap().position;
    }
    
    get type () {
        return super.unwrap().type;
    }
    
    get value () {
        return super.unwrap().value;
    }
    
    get children () {
        return super.unwrap().children;
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
}


class Mapping extends Item {
    
    get size () {
        return Array.from(this.enumerate()).length;
    }
    
    *enumerate () {}
    
    apply (key) {
        return new Undefined(null, "Mapping", key);
    }
    
    get (key) {
        return new Tuple();
    }
    
    toBoolean () {
        return this.size > 0;
    }
}


class Func extends Mapping {
    
    async apply (...items) {
        return await this.unwrap()(...items.map(unwrap));
    }
}

class Sequence extends Mapping {
    
    get size () {
        return this.unwrap().length;
    }
    
    *enumerate () {
        for (let item of this.unwrap()) {
            yield wrap(item);
        }
    }
    
    apply (...indices) {
        const values = indices.map(index => {            
            const indexItem = wrap(index);
            if (indexItem instanceof Numb) {
                let indexValue = indexItem.unwrap();
                const sequence = this.unwrap();
                indexValue = indexValue < 0 ? sequence.length + indexValue : indexValue;
                if (0 <= indexValue && indexValue < sequence.length) {
                    return sequence[Math.trunc(indexValue)];
                }            
            }
            return super.apply(index);
        });
        return new Tuple(...values).unwrap();
    }
}


class Text extends Sequence {
    
    toVoid () {
        return "";
    }
    
    toString () {
        return this.unwrap();
    }
}


class List extends Sequence {
    
    toVoid () {
        return [];
    }
    
    toString () {
        const n = this.unwrap().length;
        return n === 1 ? "[[List of 1 item]]" : `[[List of ${n} items]]`;
    }
    
    static fromTerm (term) {
        return new this(Array.from(term).map(unwrap));
    }
}


class Name extends Text {}


class Namespace extends Mapping {
    
    get size () {
        return Array.from(this.enumerate()).length;
    }
    
    *enumerate () {
        for (let key in this.unwrap()) {
            if (this._get(key) !== undefined) yield key;
        }
    }
    
    _get (name) {
        if (!matchIdentifier(name)) return undefined;
        const value = this.unwrap()[name];
        if (value === Object.prototype[name]) return undefined;
        return value;
    }
    
    apply (...names) {
        const values = names.map(name => {
            name = unwrap(name);
            const value = this._get(name);
            return value === undefined ? super.apply(name) : value;
        });
        return new Tuple(...values);
    }
    
    toBoolean () {
        const iterator = this.enumerate();
        const first = iterator.next();
        return !first.done;
    }
    
    toVoid () {
        return {};
    }
    
    toString () {
        return "{" + Array.from(this.enumerate()).join(", ") + "}";
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
            return Number.isNaN(value) ? new Undefined(null, "Number") : new Numb(value);
            
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
            Name,
                
    wrap, unwrap
};




