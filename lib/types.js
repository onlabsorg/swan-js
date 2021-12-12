const {matchIdentifier} = require("./lexer");



class Term {
    
    get typeName () {
        return this.constructor.name;
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
    
    *[Symbol.iterator] () {
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
    
    // Yields one by one all the items contained in the tuple instance, flattening
    // nested tuple. In particular, NOTHING values are ignored, because (a,(),b) 
    // should consistently be flattened to (a,b).
    *[Symbol.iterator] () {
        for (let item of this._items) {
            for (let subItem of item) yield subItem;
        }
    }
        
    // If this tuple is empty it returns `null` (JavaScript equivalent to NOTHING);
    // if this tuple contains only one item, it returns the tuple;
    // if this tuple contains two or more items, it returns this tuple itself.
    unwrap () {
        if (!this._valueCache) {
            const values = Array.from(this).map(unwrap);
            switch (values.length) {
                
                case 0:
                    this._valueCache = null;
                    break;
                    
                case 1:
                    this._valueCache = values[0];
                    break;
                    
                default:
                    this._valueCache = {
                        *[Symbol.iterator] () {
                            for (let value of values) yield value;
                        }                        
                    }
                    break;
            }
        }
        
        return this._valueCache;
    }   
    
    isNothing () {
        let iterator = this[Symbol.iterator]();
        return iterator.next().done;
    } 
    
    imapSync (f) {
        const values = Array.from(this).map(f);
        return new this.constructor(...values.map(wrap));
    }
    
    async imapAsync (f) {
        const values = await Promise.all(Array.from(this).map(f));
        return new this.constructor(...values.map(wrap));
    }
    
    vmapSync (f) {
        const values = Array.from(this).map(unwrap).map(f);
        return new this.constructor(...values.map(wrap));
    }
    
    async vmapAsync (f) {
        const values = await Promise.all(Array.from(this).map(unwrap).map(f));
        return new this.constructor(...values.map(wrap));
    }
    
    toBoolean () {
        for (let item of this) {
            if (item.toBoolean()) return true;
        }
        return false;
    }
    
    toString () {
        let text = "";
        for (let item of this) {
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



class Func extends Item {
    
    async call (...items) {
        return await this.unwrap()(...items.map(unwrap));
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



class Container extends Item {
    
    get (key) {
        return new Tuple();
    }
}



class Sequence extends Container {
    
    get size () {
        return this.unwrap().length;
    }
    
    *enumerate () {
        for (let item of this.unwrap()) {
            yield wrap(item);
        }
    }
    
    get (index, defaultValue) {
        const indexItem = wrap(index);
        index = indexItem.unwrap();
        if (indexItem instanceof Numb) {
            const sequence = this.unwrap();
            index = index < 0 ? sequence.length + index : index;
            if (0 <= index && index < sequence.length) {
                return sequence[Math.trunc(index)];
            }            
        }
        return wrap(defaultValue);
    }
    
    toBoolean () {
        return this.unwrap().length > 0;
    }
}



class Text extends Sequence {
    
    get (index) {
        return super.get(index, "");
    }
    
    toVoid () {
        return "";
    }
    
    toString () {
        return this.unwrap();
    }
}



class List extends Sequence {
    
    get (index) {
        return super.get(index, null);
    }
    
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



class Namespace extends Container {
    
    get size () {
        return Array.from(this.enumerate()).length;
    }
    
    *enumerate () {
        for (let key in this.unwrap()) {
            if (this.get(key) !== null) {
                yield key;
            }
        }
    }
    
    get (name) {
        name = unwrap(name);
        if (!matchIdentifier(name)) return null;
        return this.vmapSync(namespaceValue => {
            const value = namespaceValue[name];
            return value === Object.prototype[name] ? null : value;
        });
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
            
            // if a Tuple
            if (typeof value[Symbol.iterator] === 'function') return new Tuple(...value);
            
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
            Container, 
                Sequence, 
                    Text, 
                    List, 
                Namespace,
            Name,
                
    wrap, unwrap
};




