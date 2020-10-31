const T = require('./types');
const F = require('./builtin-functions');
const O = module.exports = {};



const defineBinaryOperation = handlers => async function (val1, val2) {
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



// -----------------------------------------------------------------------------
//  ARITHMETIC OPERATIONS
// -----------------------------------------------------------------------------

O.add = defineBinaryOperation({
    'Nothing,Anything'    : (val1, val2) => val2,
    'Boolean,Boolean'     : (val1, val2) => val1 || val2,
    'Number,Number'       : (val1, val2) => val1 + val2,
    'String,String'       : (val1, val2) => val1 + val2,
    'List,List'           : (val1, val2) => val1.concat(val2),
    'Namespace,Namespace' : (val1, val2) => Object.assign({}, val1, val2),
    'Tuple,Anything'      : (val1, val2) => mapPairs(O.add, val1, val2),
    'Anything,Tuple'      : (val1, val2) => mapPairs(O.add, val1, val2),
    'Anything,Nothing'    : (val1, val2) => val1,
    'Anything,Anything'   : (val1, val2) => F.error(`Sum operation not defined between ${T.detectType(val1)} and ${T.detectType(val2)}`)    
});

O.sub = defineBinaryOperation({
    'Nothing,Anything' : (val1, val2) => T.NOTHING,
    'Anything,Nothing' : (val1, val2) => val1,
    'Number,Number'    : (val1, val2) => val1 - val2,
    'Tuple,Anything'   : (val1, val2) => mapPairs(O.sub, val1, val2),
    'Anything,Tuple'   : (val1, val2) => mapPairs(O.sub, val1, val2),
    'Anything,Anything': (val1, val2) => F.error(`Subtraction operation not defined between ${T.detectType(val1)} and ${T.detectType(val2)}`)
});

O.mul = defineBinaryOperation({
    'Nothing,Anything'  : (val1, val2) => T.NOTHING,
    'Boolean,Boolean'   : (val1, val2) => val1 && val2,
    'Number,Number'     : (val1, val2) => val1 * val2,
    'Number,String'     : (val1, val2) => val1 < 0 ? "" : val2.repeat(val1),
    'Number,List'       : (val1, val2) => repeatList(val2, val1),
    'String,Number'     : (val1, val2) => val2 < 0 ? "" : val1.repeat(val2),
    'List,Number'       : (val1, val2) => repeatList(val1, val2),
    'Tuple,Anything'    : (val1, val2) => mapPairs(O.mul, val1, val2),
    'Anything,Tuple'    : (val1, val2) => mapPairs(O.mul, val1, val2),
    'Anything,Nothing'  : (val1, val2) => T.NOTHING,
    'Anything,Anything' : (val1, val2) => F.error(`Product operation not defined between ${T.detectType(val1)} and ${T.detectType(val2)}`)
});

O.div = defineBinaryOperation({
    'Nothing,Anything'  : (val1, val2) => T.NOTHING,
    'Number,Number'     : (val1, val2) => val1 / val2,
    'Tuple,Anything'    : (val1, val2) => mapPairs(O.div, val1, val2),
    'Anything,Tuple'    : (val1, val2) => mapPairs(O.div, val1, val2),
    'Anything,Anything' : (val1, val2) => F.error(`Division operation not defined between ${T.detectType(val1)} and ${T.detectType(val2)}`)
});

O.mod = defineBinaryOperation({
    'Nothing,Anything'  : (val1, val2) => val2,
    'Number,Number'     : (val1, val2) => val1 % val2,
    'Tuple,Anything'    : (val1, val2) => mapPairs(O.mod, val1, val2),
    'Anything,Tuple'    : (val1, val2) => mapPairs(O.mod, val1, val2),
    'Anything,Anything' : (val1, val2) => F.error(`Modulo operation not defined between ${T.detectType(val1)} and ${T.detectType(val2)}`)
});

O.pow = defineBinaryOperation({
    'Nothing,Anything'  : (val1, val2) => T.NOTHING,
    'Number,Number'     : (val1, val2) => val1 ** val2,
    'Tuple,Anything'    : (val1, val2) => mapPairs(O.pow, val1, val2),
    'Anything,Tuple'    : (val1, val2) => mapPairs(O.pow, val1, val2),
    'Anything,Anything' : (val1, val2) => F.error(`Exponentiation operation not defined between ${T.detectType(val1)} and ${T.detectType(val2)}`)
});



// -----------------------------------------------------------------------------
//  COMPARISON OPERATIONS
// -----------------------------------------------------------------------------

O.equal = defineBinaryOperation({
    "Nothing,Nothing"     : (val1, val2) => T.TRUE,
    "Boolean,Boolean"     : (val1, val2) => val1 === val2,
    "Number,Number"       : (val1, val2) => val1 === val2,
    "String,String"       : (val1, val2) => val1 === val2,
    "Function,Function"   : (val1, val2) => val1 === val2,
    "List,List"           : (val1, val2) => isSameList(val1, val2),
    "Namespace,Namespace" : (val1, val2) => isSameNamespace(val1, val2),
    'Tuple,Anything'      : (val1, val2) => isSameList(Array.from(val1), Array.from(val2)),
    'Anything,Tuple'      : (val1, val2) => isSameList(Array.from(val1), Array.from(val2)),
    "Anything,Anything"   : (val1, val2) => T.FALSE,    
});

O.compare = defineBinaryOperation({
    "Nothing,Nothing"  : (val1, val2) => 0,
    "Nothing,Anything" : (val1, val2) => -1,
    "Anything,Nothing" : (val1, val2) => +1,
    "Boolean,Boolean"  : (val1, val2) => val1 === val2 ? 0 : (val1 ? +1 : -1),
    "Number,Number"    : (val1, val2) => val1 === val2 ? 0 : (val1<val2 ? -1 : +1),
    "String,String"    : (val1, val2) => val1.localeCompare(val2),
    "List,List"        : (val1, val2) => lexCompareLists(val1, val2),
    'Tuple,Anything'   : (val1, val2) => lexCompareTuples(val1, val2),
    'Anything,Tuple'   : (val1, val2) => lexCompareTuples(val1, val2),
    "Anything,Anything": (val1, val2) => F.error(`Comparison operation not defined between ${T.detectType(val1)} and ${T.detectType(val2)}`)
});



// -----------------------------------------------------------------------------
//  MISCELLANEOUS OPERATIONS
// -----------------------------------------------------------------------------

O.pair = defineBinaryOperation({
    "Anything,Anything" : (val1, val2) => T.createTuple(val1, val2)
});

O.apply = defineBinaryOperation({
    "String,Number"      : (val1, val2) => getListItem(val1, val2) || "",
    "List,Number"        : (val1, val2) => getListItem(val1, val2) || T.NOTHING,
    "Namespace,String"   : function (val1, val2) {
        if (T.isFunction(val1.__apply__)) {
            return val1.__apply__.call(this, val2);
        }
        return T.isName(val2) && val1.hasOwnProperty(val2) ? val1[val2] : T.NOTHING;
    },
    "Namespace,Anything" : async function (val1, val2) {
        if (T.isFunction(val1.__apply__)) {
            return val1.__apply__.call(this, val2);
        }
        return T.NOTHING;
    },
    "Function,Anything"  : function (val1, val2) {
        return val1.call(this, ...T.iter(val2));        
    },
    "Anything,Anything"  : (val1, val2) => F.error(`Apply operation not defined between ${T.detectType(val1)} and ${T.detectType(val2)}`)
});

O.compose = defineBinaryOperation({
    "Anything,Anything"  : (g, f) => async x => await O.apply(g, await O.apply(f, x))
});



// -----------------------------------------------------------------------------
//  SERVICE FUNCTIONS
// -----------------------------------------------------------------------------

function *iterPairs (x, y) {
    const iX = T.iter(x)[Symbol.iterator]();
    const iY = T.iter(y)[Symbol.iterator]();
    while (true) {
        let x = iX.next();
        let y = iY.next();
        if (x.done && y.done) break;
        yield [x.value, y.value];
    }    
}

async function mapPairs (f, tuple1, tuple2) {
    const pairsTuple = T.createTuple(...iterPairs(tuple1, tuple2));
    return await pairsTuple.map(pair => f(pair[0], pair[1]));
}

function getListItem (list, index) {
    index = index < 0 ? list.length + index : index;
    return (0 <= index && index < list.length) ? list[Math.trunc(index)] : null;
}

function repeatList (list, n) {
    var product = [];
    for (let i=1; i<=n; i++) product = product.concat(list);
    return product;    
}

async function isSameList (list1, list2) {
    if (list1.length !== list2.length) return T.FALSE;
    for (let i=0; i<list1.length; i++) {
        const eq = await O.equal(list1[i], list2[i]);
        if (!eq) return T.FALSE;
    }
    return T.TRUE;
}

async function isSameNamespace (val1, val2) {
    const xNames = Object.getOwnPropertyNames(val1).filter(T.isName);
    const yNames = Object.getOwnPropertyNames(val2).filter(T.isName);
    if (xNames.length !== yNames.length) return false;
    for (let xName of xNames) {
        const xValue = val1[xName];
        const yValue = val2.hasOwnProperty(xName) ? val2[xName] : T.NOTHING;
        const eq = await O.equal(xValue, yValue);
        if (!eq) return T.FALSE;
    }
    return T.TRUE;
}

async function lexCompareLists (list1, list2) {
    const maxLength = Math.max(list1.length, list2.length);
    for (let i=0; i<maxLength; i++) {
        const cmp = await O.compare(list1[i], list2[i]);
        if (cmp !== 0) return cmp;
    }
    return 0;
}

async function lexCompareTuples (tuple1, tuple2) {
    for (let [val1, val2] of iterPairs(tuple1, tuple2)) {
        let cmp = await O.compare(val1, val2);
        if (cmp !== 0) return cmp;
    }
    return 0;
}
