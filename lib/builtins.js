/**
 *  Swan Builtins
 *  ============================================================================
 *  
 *  The swan builtins is a collection of functions and constants that are
 *  always present in a swan context.
 *  
 *  The builtins are grouped in nine namespace: `Bool`, `Numb`, `Text`, `List`,
 *  `Namespace`, `Func`, `Undefined`, `Tuple` and `Time`.
 */

const types = require("./types");


exports.require = require("./modules").require;


const SyncMap = fn => (...values) => new types.Tuple(...values.map(fn)).unwrap();

const AsyncMap = fn => async (...values) => {
    const x = new types.Tuple(...values);
    const y = await x.vmapAsync(fn);
    return y.unwrap()
}

const undefined_text = new types.Undefined("Text");
const undefined_list = new types.Undefined("List");


const Func = {
    
    compose (...funcs) {
        return this.pipe(...funcs.reverse());
    },
    
    pipe (...funcs) {
        const funcTuple = new types.Tuple(...funcs);
        return async (...args) => {
            let res = new types.Tuple(...args);
            for (let funcItem of funcTuple.items()) {
                res = await funcItem.apply(...res);
            }
            return res.unwrap();
        }
    }
}


const Undefined = {
    
    create (type, ...args) {
        return new types.Undefined(type, ...args);
    },
    
    type (undef) {
        return ensureUndefined(undef).type;
    },
    
    args (undef) {
        return ensureUndefined(undef).args;
    },
}


const Tuple = {
    
    from (value) {
        const item = types.wrap(value);
        switch (item.typeName) {
            
            case "Text": 
            case "List":
                return new types.Tuple(...value).unwrap();
                
            case "Namespace":
                return new types.Tuple(...item.domain.sort()).unwrap();
                
            default:
                return null;
        }
    },
    
    map: fn => async (...values) => {
        const image = await List.map(fn)(values);
        return new types.Tuple(...image).unwrap();
    },
}


module.exports = {}



// -----------------------------------------------------------------------------
//  Helper Functions
// -----------------------------------------------------------------------------

function isNumber (x) {
    return types.wrap(x) instanceof types.Numb;
}

function isString (x) {
    return types.wrap(x) instanceof types.Text;
}

function isList (list) {
    return Array.isArray(list);
}


function ensureBoolean (bool) {
    if (types.wrap(bool) instanceof types.Bool) return bool;
    throw new TypeError("Bool type expected");
}


function ensureNumber (x) {
    if (!isNumber(x)) throw new TypeError("Numb type expected");
    return x;
}

function ensureString (string) {
    if (typeof string !== "string") throw new TypeError("Text type expected");
    return string;
}

function ensureList (list) {
    if (!Array.isArray(list)) throw new TypeError("List type expected");
    return list;
}

function ensureNamespace (ns) {
    if (types.wrap(ns) instanceof types.Namespace) return ns;
    throw new TypeError("Namespace type expected");
}

function ensureUndefined (undef) {
    if (undef instanceof types.Undefined) return undef;
    throw new TypeError("Undefined type expected");
}
