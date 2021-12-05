

class Term {
    
    get typeName () {
        return this.constructor.name;
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
}



class Tuple extends Term {
    
    // Creates an Tuple instance given a sequence of values. The passed values
    // can items and/or tuples. The iterator function will take care of flattening
    // the tuple, so that `new TupleObject(a, new TupleObject(b, c))` is
    // equivalent to `new TupleObject(a, b, c)`.
    constructor (...items) {
        super();
        this._items = items;
    }
    
    // Yields one by one all the items contained in the tuple instance, flattening
    // nested tuple. In particular, NOTHING values are ignored, because (a,(),b) 
    // should consistently be flattened to (a,b).
    *[Symbol.iterator] () {
        for (let item of this._items) {
            if (item instanceof this.constructor) {
                for (let subItem of item) yield subItem;
            } else {
                yield item;
            }
        }
    }
        
    // If this tuple is empty it returns `null` (JavaScript equivalent to NOTHING);
    // if this tuple contains only one item, it returns the tuple;
    // if this tuple contains two or more items, it returns this tuple itself.
    unwrap () {
        let iterator = this[Symbol.iterator]();
        let first = iterator.next();
        if (first.done) return null;
        if (iterator.next().done) return first.value.unwrap();
        
        const items = Array.from(this).map(item => item.unwrap());
        return {
            *[Symbol.iterator] () {
                for (let item of items) yield item;
            }
        };
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
}



class Bool extends Item {}



class Numb extends Item {}



class Func extends Item {}



class Undefined extends Item {
    
    constructor (position, type, value, ...children) {
        super({position, type, value, children});
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
}



class Container extends Item {
    
    get (key) {
        return new Tuple();
    }
}



class Sequence extends Container {
    
    get (index, defaultValue) {
        if (wrap(index) instanceof Numb) {
            const sequence = super.unwrap();
            index = index < 0 ? sequence.length + index : index;
            if (0 <= index && index < sequence.length) {
                return sequence[Math.trunc(index)];
            }            
        }
        return wrap(defaultValue);
    }
}



class Text extends Sequence {
    
    get (index) {
        return super.get(index, "");
    }
}



class List extends Sequence {
    
    get (index) {
        return super.get(index, null);
    }
    
    unwrap () {
        return super.unwrap().map(unwrap);
    }
}



class Name extends Text {}



class Namespace extends Container {
    
    get (name) {
        return this.vmapSync(namespaceValue => {
            const value = namespaceValue[name];
            return value === Object.prototype[name] ? null : value;
        });
    }
}



function wrap (value) {
    
    // if nothing
    if (value === null || value === undefined || Number.isNaN(value)){
        return new Tuple();
    }
    
    // if it is already wrapped
    if (value instanceof Term) return value;
    
    // if primitive
    switch (typeof value) {
        case "boolean"  : return new Bool(value);
        case "number"   : return new Numb(value);
        case "string"   : return new Text(value);
        case "function" : return new Func(value);
    }    
    
    // It must be an object!
    
    // if a List
    if (Array.isArray(value)) return new List(value);
    
    // if a Tuple
    if (typeof value[Symbol.iterator] === 'function') {
        return new Tuple(...value);
    }
    
    // if a primitive object
    switch (Object.prototype.toString.call(value)) {
        case '[object Boolean]'  : return new Bool(value);
        case '[object Number]'   : return new Numb(value);
        case '[object String]'   : return new Text(value);
        case '[object Function]' : return new Func(value);
    }
    
    // It is a Namespace!
    return new Namespace(value);
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
