const T = module.exports = {};





// -----------------------------------------------------------------------------
//  TUPLE TYPE
// -----------------------------------------------------------------------------

T.createTuple = (...items) => {
    const tuple = new Tuple(items);

    let iterator = tuple[Symbol.iterator]();
    
    let first = iterator.next();
    if (first.done) return T.NOTHING;
    return iterator.next().done ? first.value : tuple;
}

class Tuple {
    
    constructor (items) {
        this._items = items;
    }

    *[Symbol.iterator] () {
        for (let item of this._items) {
            if (item instanceof this.constructor) {
                for (let subItem of item) yield subItem;
            } else if (!T.isNothing(item)) {
                yield item;
            }
        }            
    }
    
    async map (f) {
        var image = T.NOTHING;
        for (let item of this) {
            image = T.createTuple(image, await f(item));
        }
        return image;
    }
}

T.iter = function* (vals) {
    switch (T.detectType(vals)) {
        case "Nothing": 
            break;
        case "Tuple":
            for (let val of vals) yield val;
            break;
        default:
            yield vals;
    }
}





// -----------------------------------------------------------------------------
//  TYPE DETECTION
// -----------------------------------------------------------------------------

T.detectType = val => {
        
    // if Nothing
    if (T.isNothing(val)) return "Nothing";

    // if primitive
    switch (typeof val) {
        case "boolean"  : return "Boolean";
        case "number"   : return "Number";
        case "string"   : return "String";
        case "function" : return "Function";
    }    
    
    // It must be an object!
    
    // if List
    if (Array.isArray(val)) return "List";
    
    // if a Tuple
    if (T.isTuple(val)) return "Tuple";
    
    // if a primitive object
    switch (Object.prototype.toString.call(val)) {
        case '[object Boolean]': return "Boolean";
        case '[object Number]' : return "Number";
        case '[object String]' : return "String";
    }
    
    // It is a Namespace without name tag!
    return "Namespace";
}

T.isNothing = val => val === null || val === undefined || Number.isNaN(val);
T.isString = val => typeof val === 'string';
T.isTuple = val => val instanceof Tuple;
T.isNamespace = val => T.detectType(val) === 'Namespace';
T.isFunction = val => typeof val === 'function';
T.isName = val => /^[a-z_A-Z]+[a-z_A-Z0-9]*$/.test(val);




// -----------------------------------------------------------------------------
//  CONSTANTS
// -----------------------------------------------------------------------------

T.NOTHING = null;
T.TRUE = true;
T.FALSE = false;




// -----------------------------------------------------------------------------
//  POLYMORPHIC BINARY OPERATIONS
// -----------------------------------------------------------------------------

T.defineBinaryOperation = handlers => async function (val1, val2) {
    const type1 = T.detectType(val1);
    const type2 = T.detectType(val2);
    const id = `${type1},${type2}`;
    const handlerFn = 
            handlers[`${type1},${type2}`] || 
            handlers[`${type1},Anything`] || 
            handlers[`Anything,${type2}`] || 
            handlers[`Anything,Anything`] ;
    return handlerFn.call(this, val1, val2);
}
