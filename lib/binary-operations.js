const T = require('./types');
const F = require('./builtin-functions');
const O = module.exports = {};



// -----------------------------------------------------------------------------
//  ARITHMETIC OPERATIONS: SUM
// -----------------------------------------------------------------------------

O.add = async (self, other) => await (await T.resolveName(self, '__add__')(self))(other);

T.Nothing.__add__ = self => T.defineFunction({
    'Anything' : other => other,
});

T.Boolean.__add__ = self => T.defineFunction({
    'Boolean'  : other => self || other,
    'Anything' : other => T.Anything.__add__(self)(other)
});

T.Number.__add__ = self => T.defineFunction({
    'Number'   : other => self + other,
    'Anything' : other => T.Anything.__add__(self)(other)
});

T.String.__add__ = self => T.defineFunction({
    'String'   : other => self + other,
    'Anything' : other => T.Anything.__add__(self)(other)
});

T.List.__add__ = self => T.defineFunction({
    'List'     : other => self.concat(other),
    'Anything' : other => T.Anything.__add__(self)(other)
});

T.Namespace.__add__ = self => T.defineFunction({
    'Namespace': other => Object.assign({}, self, other),
    'Anything' : other => T.Anything.__add__(self)(other)
});

T.Tuple.__add__ = self => T.defineFunction({
    'Anything' : other => mapPairs(O.add, self, other)
});

T.Anything.__add__ = self => T.defineFunction({
    'Tuple'    : other => mapPairs(O.add, self, other),
    'Nothing'  : other => self,
    'Anything' : other => F.error(`Sum operation not defined between ${T.detectType(self)} and ${T.detectType(other)}`)
});



// -----------------------------------------------------------------------------
//  ARITHMETIC OPERATIONS: SUBTRACTION
// -----------------------------------------------------------------------------

O.sub = async (self, other) => await (await T.resolveName(self, '__sub__')(self))(other);

T.Nothing.__sub__ = self => T.defineFunction({
    'Anything' : other => self
});

T.Number.__sub__ = self => T.defineFunction({
    'Number'   : other => self - other,
    'Anything' : other => T.Anything.__sub__(self)(other)
});

T.Tuple.__sub__ = self => T.defineFunction({
    'Anything' : other => mapPairs(O.sub, self, other)
});

T.Anything.__sub__ = self => T.defineFunction({
    'Nothing'  : other => self,
    'Tuple'    : other => mapPairs(O.sub, self, other),
    'Anything' : other => F.error(`Subtraction operation not defined between ${T.detectType(self)} and ${T.detectType(other)}`)
});



// -----------------------------------------------------------------------------
//  ARITHMETIC OPERATIONS: PRODUCT
// -----------------------------------------------------------------------------

O.mul = async (self, other) => await (await T.resolveName(self, '__mul__')(self))(other);

T.Nothing.__mul__ = self => T.defineFunction({
    'Anything' : other => T.NOTHING,
});

T.Boolean.__mul__ = self => T.defineFunction({
    'Boolean'  : other => self && other,
    'Anything' : other => T.Anything.__mul__(self)(other)
});

T.Number.__mul__ = self => T.defineFunction({
    'Number'   : other => self * other,
    'String'   : other => self < 0 ? "" : other.repeat(self),
    'List'     : other => repeatList(other, self),
    'Anything' : other => T.Anything.__mul__(self)(other)
});

T.String.__mul__ = self => T.defineFunction({
    'Number'   : other => other < 0 ? "" : self.repeat(other),
    'Anything' : other => T.Anything.__mul__(self)(other)
});

T.List.__mul__ = self => T.defineFunction({
    'Number'   : other => repeatList(self, other),
    'Anything' : other => T.Anything.__mul__(self)(other)
});

T.Tuple.__mul__ = self => T.defineFunction({
    'Anything' : other => mapPairs(O.mul, self, other)
});

T.Anything.__mul__ = self => T.defineFunction({
    'Tuple'    : other => mapPairs(O.mul, self, other),
    'Nothing'  : other => T.NOTHING,
    'Anything' : other => F.error(`Product operation not defined between ${T.detectType(self)} and ${T.detectType(other)}`)
});



// -----------------------------------------------------------------------------
//  ARITHMETIC OPERATIONS: DIVISION
// -----------------------------------------------------------------------------

O.div = async (self, other) => await (await T.resolveName(self, '__div__')(self))(other);

T.Nothing.__div__ = self => T.defineFunction({
    'Anything' : other => T.NOTHING
});

T.Number.__div__ = self => T.defineFunction({
    'Number'   : other => self / other,
    'Anything' : other => T.Anything.__div__(self)(other)
});

T.Tuple.__div__ = self => T.defineFunction({
    'Anything' : other => mapPairs(O.div, self, other)
});

T.Anything.__div__ = self => T.defineFunction({
    'Tuple'    : other => mapPairs(O.div, self, other),
    'Anything' : other => F.error(`Division operation not defined between ${T.detectType(self)} and ${T.detectType(other)}`)
});



// -----------------------------------------------------------------------------
//  ARITHMETIC OPERATIONS: MODULO
// -----------------------------------------------------------------------------

O.mod = async (self, other) => await (await T.resolveName(self, '__mod__')(self))(other);

T.Nothing.__mod__ = self => T.defineFunction({
    'Anything' : other => other
});

T.Number.__mod__ = self => T.defineFunction({
    'Number'   : other => self % other,
    'Anything' : other => T.Anything.__mod__(self)(other)
});

T.Tuple.__mod__ = self => T.defineFunction({
    'Anything' : other => mapPairs(O.mod, self, other)
});

T.Anything.__mod__ = self => T.defineFunction({
    'Tuple'    : other => mapPairs(O.mod, self, other),
    'Anything' : other => F.error(`Modulo operation not defined between ${T.detectType(self)} and ${T.detectType(other)}`)
});



// -----------------------------------------------------------------------------
//  ARITHMETIC OPERATIONS: EXPONENTIATION
// -----------------------------------------------------------------------------

// O.pow = T.defineBinaryOperation({
//     'Nothing,Anything'  : (val1, val2) => T.NOTHING,
//     'Number,Number'     : (val1, val2) => val1 ** val2,
//     'Tuple,Anything'    : (val1, val2) => mapPairs(O.pow, val1, val2),
//     'Anything,Tuple'    : (val1, val2) => mapPairs(O.pow, val1, val2),
//     'Anything,Anything' : (val1, val2) => F.error(`Exponentiation operation not defined between ${T.detectType(val1)} and ${T.detectType(val2)}`)
// });

O.pow = async (self, other) => await (await T.resolveName(self, '__pow__')(self))(other);

T.Nothing.__pow__ = self => T.defineFunction({
    'Anything' : other => T.NOTHING
});

T.Number.__pow__ = self => T.defineFunction({
    'Number'   : other => self ** other,
    'Anything' : other => T.Anything.__pow__(self)(other)
});

T.Tuple.__pow__ = self => T.defineFunction({
    'Anything' : other => mapPairs(O.pow, self, other)
});

T.Anything.__pow__ = self => T.defineFunction({
    'Tuple'    : other => mapPairs(O.pow, self, other),
    'Anything' : other => F.error(`Exponentiation operation not defined between ${T.detectType(self)} and ${T.detectType(other)}`)
});




// -----------------------------------------------------------------------------
//  COMPARISON OPERATIONS: EQUALITY
// -----------------------------------------------------------------------------

O.equal = async (self, other) => await (await T.resolveName(self, '__eq__')(self))(other);

T.Nothing.__eq__ = self => T.defineFunction({
    'Nothing'  : other => T.TRUE,
    'Anything' : other => T.FALSE,
});

T.Boolean.__eq__ = self => T.defineFunction({
    'Boolean'  : other => self === other,
    'Anything' : other => T.FALSE,
});

T.Number.__eq__ = self => T.defineFunction({
    'Number'   : other => self === other,
    'Anything' : other => T.FALSE,
});

T.String.__eq__ = self => T.defineFunction({
    'String'   : other => self === other,
    'Anything' : other => T.FALSE,
});

T.List.__eq__ = self => T.defineFunction({
    'List'     : other => isSameList(self, other),
    'Anything' : other => T.FALSE,
});

T.Namespace.__eq__ = self => T.defineFunction({
    'Namespace': other => isSameNamespace(self, other),
    'Anything' : other => T.FALSE,
});

T.Function.__eq__ = self => T.defineFunction({
    'Function' : other => self === other,
    'Anything' : other => T.FALSE,
});

T.Tuple.__eq__ = self => T.defineFunction({
    'Anything' : other => isSameList(Array.from(self), Array.from(other)),
});

T.Anything.__eq__ = self => T.defineFunction({
    'Tuple'    : other => isSameList(Array.from(self), Array.from(other)),
    'Anything' : other => T.FALSE,
});



// -----------------------------------------------------------------------------
//  COMPARISON OPERATIONS: ORDER
// -----------------------------------------------------------------------------

O.compare = async (self, other) => await (await T.resolveName(self, '__cmp__')(self))(other);

T.Nothing.__cmp__ = self => T.defineFunction({
    'Nothing'  : other => 0,
    'Anything' : other => -1,
});

T.Boolean.__cmp__ = self => T.defineFunction({
    'Boolean'  : other => self === other ? 0 : (self ? +1 : -1),
    'Anything' : other => T.Anything.__cmp__(self)(other)
});

T.Number.__cmp__ = self => T.defineFunction({
    'Number'   : other => self === other ? 0 : (self<other ? -1 : +1),
    'Anything' : other => T.Anything.__cmp__(self)(other)
});

T.String.__cmp__ = self => T.defineFunction({
    'String'   : other => self.localeCompare(other),
    'Anything' : other => T.Anything.__cmp__(self)(other)
});

T.List.__cmp__ = self => T.defineFunction({
    'List'     : other => lexCompareLists(self, other),
    'Anything' : other => T.Anything.__cmp__(self)(other)
});

T.Tuple.__cmp__ = self => T.defineFunction({
    'Anything' : other => lexCompareTuples(self, other),
});

T.Anything.__cmp__ = self => T.defineFunction({
    'Nothing'  : other => +1,
    'Tuple'    : other => lexCompareTuples(self, other),
    'Anything' : other => F.error(`Comparison operation not defined between ${T.detectType(self)} and ${T.detectType(other)}`),
});



// -----------------------------------------------------------------------------
//  MISCELLANEOUS OPERATIONS: PAIR
// -----------------------------------------------------------------------------

O.pair = (self, other) => T.createTuple(self, other);



// -----------------------------------------------------------------------------
//  MISCELLANEOUS OPERATIONS: APPLY
// -----------------------------------------------------------------------------

O.apply = async (self, other) => await (await T.resolveName(self, '__apply__')(self))(other);

T.String.__apply__ = self => T.defineFunction({
    'Number'   : other => getListItem(self, other) || "",
    'Anything' : other => T.Anything.__apply__(self)(other)
});

T.List.__apply__ = self => T.defineFunction({
    'Number'   : other => getListItem(self, other) || T.NOTHING,
    'Anything' : other => T.Anything.__apply__(self)(other)
});

T.Namespace.__apply__ = self => T.defineFunction({
    'String'   : other => T.isName(other) && self.hasOwnProperty(other) ? self[other] : T.NOTHING,
    'Anything' : other => T.NOTHING
});

T.Function.__apply__ = self => T.defineFunction({
    'Anything' : other => self(...T.iter(other))
});

T.Anything.__apply__ = self => T.defineFunction({
    'Anything' : other => F.error(`Apply operation not defined between ${T.detectType(self)} and ${T.detectType(other)}`)
});



// -----------------------------------------------------------------------------
//  MISCELLANEOUS OPERATIONS: COMPOSE
// -----------------------------------------------------------------------------

O.compose = (g, f) => async x => await O.apply(g, await O.apply(f, x));



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
