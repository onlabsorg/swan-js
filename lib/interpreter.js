
// -----------------------------------------------------------------------------
//  TYPE DETECTION
// -----------------------------------------------------------------------------

function detectItemType (item) {
    
    // if primitive
    switch (typeof item) {
        case "boolean"  : return "Boolean";
        case "number"   : return "Number";
        case "string"   : return "String";
        case "function" : return "Function";
    }    
    
    // It must be an object!
    
    // if a List
    if (Array.isArray(item)) return "List";
    
    // if a primitive object
    switch (Object.prototype.toString.call(item)) {
        case '[object Boolean]'  : return "Boolean";
        case '[object Number]'   : return "Number";
        case '[object String]'   : return "String";
        case '[object Function]' : return "Function";
    }
    
    // It is a Namespace!
    return "Namespace";        
}

const isNothing = x => x === null || x === undefined || Number.isNaN(x);
const isBoolean = x => typeof x === 'boolean' || (typeof x === 'object' && Object.prototype.toString.call(x) === '[object Boolean]')
const isNumber = x => typeof x === 'number' || (typeof x === 'object' && Object.prototype.toString.call(x) === '[object Number]')
const isFunction = x => typeof x === 'function' || (typeof x === 'object' && Object.prototype.toString.call(x) === '[object Function]')
const isString = x => typeof x === 'string' || (typeof x === 'object' && Object.prototype.toString.call(x) === '[object String]');
const isList = x => x && Array.isArray(x);
const isNamespace = x => detectItemType(x) === 'Namespace';
const isName = x => isString(x) && /^[a-z_A-Z]+[a-z_A-Z0-9]*$/.test(x);



// -----------------------------------------------------------------------------
//  TYPE CASTING
// -----------------------------------------------------------------------------

function convertItemToBoolean (item) {
    const itemType = detectItemType(item);
    switch (itemType) {
        case "Boolean"  : return item;
        case "Number"   : return item !== 0;
        case "String"   : return item !== "";
        case "List"     : return item.length !== 0;
        case "Namespace": return listNamespaceNames(item).length !== 0;
        case "Function" : return true;
        default         : throw new Error(`Cannot convert ${itemType} to Boolean`);
    }                
}

function convertItemToString (item) {
    const itemType = detectItemType(item);
    switch (itemType) {
        case "Boolean"  : return item ? "TRUE" : "FALSE";
        case "Number"   : return String(item);
        case "Function" : return "[[Function]]";
        case "String"   : return item;
        case "List"     : return `[[List of ${item.length} items]]`;
        case "Namespace": return `[[Namespace of ${countNamespaceNames(item)} items]]`;
        default         : throw new Error(`Cannot convert ${itemType} to String`);
    }
}


// -----------------------------------------------------------------------------
//  TUPLES
// -----------------------------------------------------------------------------

function Tuple (...items) {
    if (items.length === 1 && items[0] instanceof TupleObject) return items[0];
    return new TupleObject(...items);
}

class TupleObject {
    
    constructor (...items) {
        this._items = items;
    }
    
    *[Symbol.iterator] () {
        for (let item of this._items) {
            if (item instanceof this.constructor) {
                for (let subItem of item) yield subItem;
            } else if (!isNothing(item)) {
                yield item;
            }
        }
    }
    
    isEmpty () {
        let iterator = this[Symbol.iterator]();
        let first = iterator.next();
        return first.done;
    }
    
    mapSync (f) {
        let image = new this.constructor();
        for (let item of this) {
            image = new this.constructor(image, f(item));
        }
        return image;
    }

    async mapAsync (f) {
        let image = new this.constructor();
        for (let item of this) {
            image = new this.constructor(image, await f(item));
        }
        return image;
    }
    
    normalize () {
        let iterator = this[Symbol.iterator]();
        let first = iterator.next();
        if (first.done) return null;
        return iterator.next().done ? first.value : this;
    }
}

Tuple.prototype = TupleObject.prototype;

function *iterPairs (x, y) {
    const iX = Tuple(x)[Symbol.iterator]();
    const iY = Tuple(y)[Symbol.iterator]();
    while (true) {
        let x = iX.next();
        let y = iY.next();
        if (x.done && y.done) break;
        yield [x.value, y.value];
    }    
}

function mapPairs (x, y, map) {
    const pairsMapping = [];
    for (let [xItem, yItem] of iterPairs(x,y)) {
        pairsMapping.push( map(xItem, yItem) );
    }
    return Tuple(...pairsMapping).normalize();
}



// -----------------------------------------------------------------------------
//  NAMESPACES
// -----------------------------------------------------------------------------

function listNamespaceNames (namespace) {
    const names = [];
    for (let name in namespace) {
        if (isName(name)) names.push(name);
    }
    return names;
}

function countNamespaceNames (namespace) {
    let count = 0;
    for (let name in namespace) {
        if (isName(name)) count++;
    }
    return count;
}

function getNamespaceAttribute (namespace, name) {
    if (!isName(name)) return null;
    const value = namespace[name];
    return (value !== undefined && value !== Object.prototype[name]) ? value : null;
}



// -----------------------------------------------------------------------------
//  SEQUENCES
// -----------------------------------------------------------------------------

function getSequenceItem (sequence, index, defaultValue) {
    if (!isNumber(index)) return defaultValue;
    index = index < 0 ? sequence.length + index : index;
    return (0 <= index && index < sequence.length) ? sequence[Math.trunc(index)] : defaultValue;
}

function repeatList (list, n) {
    var product = [];
    for (let i=1; i<=n; i++) product = product.concat(list);
    return product;    
}



// -----------------------------------------------------------------------------
//  NUMBERS
// -----------------------------------------------------------------------------

function* aritmeticSequence1 (n) {
    if (n > 0) {
        for (let i=0; i<n; i++) yield i;
    } else if (n < 0) {
        for (let i=0; i>n; i--) yield i;
    }
}




// -----------------------------------------------------------------------------
//  ERRORS
// -----------------------------------------------------------------------------

// Error wrapper thrown by context.$error
class Failure extends Error {
    
    constructor (error) {
        if (error instanceof Error) {
            super(error.message);
            this.error = error;
        } else {
            super(String(error));
            this.error = new Error(this.message);
        }
                
        // added by the parser
        this.location = error.location || {source:"", position:0, line:"", row:0, column:0};
        
        // eventually added by context.$apply
        this.parent = error.parent || null; 
        
        // eventually added by context.quit
        this.args = error.args || null;     
    }
    
    get name () {
        return "Failure";
    }
    
    get failureStack () {
        return  `@ ${this.location.line}\n` +
                `  ${' '.repeat(this.location.column)}^\n` + 
                (this.parent ? this.parent.failureStack : "");
    }
    
    toString () {
        return super.toString();
    }
}

// Error thrown by context.quit
class QuitError extends Error {
    
    constructor (message, ...otherArgs) {
        super(isString(message) ? message : "Undefined error!");
        this.args = Tuple(message, ...otherArgs);
    }
}

// Error wrapper thrown by context.$apply
class FunctionCallError extends Error {
    
    constructor (parentError) {
        super(parentError.message);
        this.parent = parentError;
        this.args = parentError.args || null;
    }
}



// -----------------------------------------------------------------------------
//  COMPARISON
// -----------------------------------------------------------------------------

function isSameTuple (tuple1, tuple2) {
    for (let [item1, item2] of iterPairs(tuple1, tuple2)) {
        if (!isSameItem(item1, item2)) return false;
    }
    return true;    
}

function isSameNamespace (namespace1, namespace2) {
    const nameList1 = listNamespaceNames(namespace1);
    const nameList2 = listNamespaceNames(namespace2);
    if (nameList1.length !== nameList2.length) return false;
    for (let name of nameList1) {
        const value1 = getNamespaceAttribute(namespace1, name);
        const value2 = getNamespaceAttribute(namespace2, name);
        if (!isSameTuple(value1, value2)) return false;
    }
    return true;
}

function isSameItem (item1, item2) {
    
    if (isNothing(item1) && !isNothing(item2)) return false;
    if (isNothing(item2)) return false;
    
    const type1 = detectItemType(item1);
    const type2 = detectItemType(item2);
    
    switch (`${type1},${type2}`) {
        case "List,List"          : return isSameList(item1, item2);
        case "Namespace,Namespace": return isSameNamespace(item1, item2);
        default                   : return item1 === item2;
    }    
}

function isSameList (list1, list2) {
    if (list1.length !== list2.length) return false;
    for (let i=0; i<list1.length; i++) {
        if(!isSameTuple(list1[i], list2[i])) return false;
    }
    return true;
}

function compareTuples (tuple1, tuple2) {
    for (let [item1, item2] of iterPairs(tuple1, tuple2)) {
        let cmp = compareItems(item1, item2);
        if (cmp !== 0) return cmp;
    }
    return 0;   
}

function compareItems (item1, item2) {
    if (isNothing(item1)) return isNothing(item2) ? 0 : -1;
    if (isNothing(item2)) return +1;
    
    const type1 = detectItemType(item1);
    const type2 = detectItemType(item2);
    switch (`${type1},${type2}`) {
        case "Boolean,Boolean": return item1 === item2 ? 0 : (item1 ? +1 : -1);
        case "Number,Number"  : return item1 === item2 ? 0 : (item1<item2 ? -1 : +1);
        case "String,String"  : return item1.localeCompare(item2);
        case "List,List"      : return lexCompareLists(item1, item2);
        default               : throw new Error(`Comparison operation not defined between ${type1} and ${type2}`);
    }    
}

function lexCompareLists (list1, list2) {
    const maxLength = Math.max(list1.length, list2.length);
    for (let i=0; i<maxLength; i++) {
        const cmp = compareTuples(list1[i], list2[i]);
        if (cmp !== 0) return cmp;
    }
    return 0;
}



// -----------------------------------------------------------------------------
//  PARSER
// -----------------------------------------------------------------------------

const Parser = require("./parser");

const parse = Parser({

     binaryOperations: {
         ","  : {precedence:10, handler:"$pair"    },
         ":"  : {precedence:12, handler:"$label"   },
         "="  : {precedence:12, handler:"$set"     },
         "=>" : {precedence:13, handler:"$tmap"    },
         "->" : {precedence:14, handler:"$def",  right:true},

         ";"  : {precedence:21, handler:"$else"},
         "?"  : {precedence:22, handler:"$if"  },
         "|"  : {precedence:23, handler:"$or"  },
         "&"  : {precedence:23, handler:"$and" },
         "==" : {precedence:24, handler:"$eq"  },
         "!=" : {precedence:24, handler:"$ne"  },
         "<"  : {precedence:24, handler:"$lt"  },
         "<=" : {precedence:24, handler:"$le"  },
         ">"  : {precedence:24, handler:"$gt"  },
         ">=" : {precedence:24, handler:"$ge"  },
         "+"  : {precedence:25, handler:"$add" },
         "-"  : {precedence:25, handler:"$sub" },
         "*"  : {precedence:26, handler:"$mul" },
         "/"  : {precedence:26, handler:"$div" },
         "%"  : {precedence:26, handler:"$mod" },
         "^"  : {precedence:27, handler:"$pow" },

         "."  : {precedence:30, handler:"$dot" },
         ""   : {precedence:30, handler:"$apply" },
     },

     voidHandler        : "$nothing",
     nameHandler        : "$name",
     stringHandler1     : "$str1",
     stringHandler2     : "$str2",
     stringHandler3     : "$strt",
     numberHandler      : "$numb",
     squareGroupHandler : "$list",
     curlyGroupHandler  : "$namespace",
     errorHandler       : "$error"
});



// -----------------------------------------------------------------------------
//  CONTEXT
// -----------------------------------------------------------------------------

const context = {

    $nothing () {
        return null;
    },

    $str1 (value) {
        return value;
    },

    $str2 (value) {
        return value;
    },

    async $strt (value) {
        const expressions = [];
        value = value.replace(/\${([\s\S]+?)}/g, (match, expression) => {
            const i = expressions.length;
            expressions.push( parse(expression) );
            return "${" + i + "}";
        });
        for (let i=0; i<expressions.length; i++) {
            const evaluateXp = expressions[i];
            const xpVal = await evaluateXp(this);
            const xpStr = await this.str(xpVal);
            value = value.replace("${" + i + "}", xpStr);
        }
        return value;
    },

    $numb (value) {
        return value;
    },

    $error (error) {
        if (error instanceof Failure) throw error;
        throw new Failure(error);
    },

    async $pair (X, Y) {
        return Tuple(await X(this), await Y(this));
    },

    async $list (X) {
        const x = await X(this);
        return Array.from(Tuple(x));
    },

    async $name (name) {
        return getNamespaceAttribute(this, name);
    },

    async $label (X, Y) {
        const x = await X({
            $nothing: this.$nothing,
            $name: name => name,
            $pair: this.$pair
        });
        const y = await Y(this);
        
        const names = Array.from(Tuple(x));
        const values = Array.from(Tuple(y));
        
        if (values.length > names.length) {
            values[names.length-1] = Tuple(...values.slice(names.length-1)).normalize();
        }
        for (var i=0; i<names.length; i++) {
            this[names[i]] = i < values.length ? values[i] : null;
        }    
        
        return y;
    },

    async $set (X, Y) {
        await this.$label(X, Y);
        return null;
    },

    async $namespace (X) {
        const context = Object.create(this);
        await X(context);
        return Object.assign({}, context);
    },

    $def (params, expression) {
        const func = async (...args) => {
            const functionContext = Object.create(this);
            await functionContext.$set(params, () => Tuple(...args).normalize());
            return await expression(functionContext);
        }
        func.toSource = async () => `((${await params(serializationContext)})->${await expression(serializationContext)})`;
        return func;
    },
    
    async $apply (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        
        return await Tuple(x).mapAsync(async xItem => {
            
            const xItemType = detectItemType(xItem);
            switch (xItemType) {
                case "Function" :
                    try {
                        return await xItem.call(this, ...Tuple(y));
                    } catch (parentError) {
                        throw new FunctionCallError(parentError);
                    }                    
                case "Namespace": return Tuple(y).mapSync(name => getNamespaceAttribute(xItem, name)).normalize();
                case "List"     : return Tuple(y).mapSync(i => getSequenceItem(xItem, i, null)).normalize();
                case "String"   : return Tuple(y).mapSync(i => getSequenceItem(xItem, i, "")).normalize();
                default         : throw new Error(`Apply operation not defined on ${xItemType} type.`);
            }
            
        }).then(tuple => tuple.normalize());
    },

    async $tmap (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await Tuple(x)
                .mapAsync(item => this.$apply(()=>y, ()=>item))
                .then(tuple => tuple.normalize());
    },

    async $dot (X, Y) {
        const x = await X(this);
        return await Tuple(x).mapAsync(async xItem => {
            
            if (!isNamespace(xItem)) {
                throw new Error("Namespace expected on the left side of the '.' operator");
            }
            const childNamespace = this.$extend(xItem);
            return await Y(childNamespace);
            
        }).then(tuple => tuple.normalize());
    },

    async $or (X, Y) {
        const x = await X(this);
        if (await this.bool(x)) return x;
        return await Y(this);
    },

    async $and (X, Y) {
        const x = await X(this);
        if (await this.not(x)) return x;
        return await Y(this);
    },

    async $if (X, Y) {
        const x = await X(this);
        return (await this.bool(x)) ? await Y(this) : null;
    },

    async $else (X, Y) {
        const x = await X(this);
        return Tuple(x).isEmpty() ? await Y(this) : x;
    },

    async $add (X, Y) {
        const xTuple = await X(this);
        const yTuple = await Y(this);
        return await mapPairs(xTuple, yTuple, (x, y) => {
            
            if (isNothing(x)) return y;
            if (isNothing(y)) return x;
            
            const xType = detectItemType(x);
            const yType = detectItemType(y);
            
            switch (`${xType},${yType}`) {
                case "Boolean,Boolean"    : return x || y;
                case "Number,Number"      : return x + y;
                case "String,String"      : return x + y;
                case "List,List"          : return x.concat(y);
                case "Namespace,Namespace": return Object.assign({}, x, y);
                default                   : throw new Error(`Sum operation not defined between ${xType} and ${yType}`);
            }
            
        });
    },

    async $sub (X, Y) {
        const xTuple = await X(this);
        const yTuple = await Y(this);
        return await mapPairs(xTuple, yTuple, (x, y) => {
            
            if (isNothing(y)) return x;
            if (isNothing(x)) throw new Error(`Subtraction operation not defined between NOTHING and ${detectItemType(y)}`);

            const xType = detectItemType(x);
            const yType = detectItemType(y);
            switch (`${xType},${yType}`) {
                case "Number,Number" : return x - y;
                default              : throw new Error(`Subtraction operation not defined between ${xType} and ${yType}`);
            }
            
        });
    },

    async $mul (X, Y) {
        const xTuple = await X(this);
        const yTuple = await Y(this);
        return await mapPairs(xTuple, yTuple, (x, y) => {
            
            if (isNothing(x)) return null;
            if (isNothing(y)) return null;

            const xType = detectItemType(x);
            const yType = detectItemType(y);
            switch (`${xType},${yType}`) {
                case "Boolean,Boolean"    : return x && y;
                case "Number,Number"      : return x * y;
                case "Number,String"      : return x < 0 ? "" : y.repeat(x);
                case "String,Number"      : return y < 0 ? "" : x.repeat(y);
                case "Number,List"        : return repeatList(y, x);
                case "List,Number"        : return repeatList(x, y);
                default                   : throw new Error(`Product operation not defined between ${xType} and ${yType}`);
            }
            
        });
    },

    async $div (X, Y) {
        const xTuple = await X(this);
        const yTuple = await Y(this);
        return await mapPairs(xTuple, yTuple, (x, y) => {
            
            if (isNothing(x)) return null;
            if (isNothing(y)) throw new Error(`Division operation not defined between ${detectItemType(x)} and NOTHING`);

            const xType = detectItemType(x);
            const yType = detectItemType(y);
            switch (`${xType},${yType}`) {
                case "Number,Number" : return x / y;
                default              : throw new Error(`Division operation not defined between ${xType} and ${yType}`);
            }
            
        });
    },

    async $mod (X, Y) {
        const xTuple = await X(this);
        const yTuple = await Y(this);
        return await mapPairs(xTuple, yTuple, (x, y) => {
            
            if (isNothing(x)) return null;
            if (isNothing(y)) throw new Error(`Modulo operation not defined between ${detectItemType(x)} and NOTHING`);

            const xType = detectItemType(x);
            const yType = detectItemType(y);
            switch (`${xType},${yType}`) {
                case "Number,Number" : return x % y;
                default              : throw new Error(`Modulo operation not defined between ${xType} and ${yType}`);
            }
            
        });
    },

    async $pow (X, Y) {
        const xTuple = await X(this);
        const yTuple = await Y(this);
        return await mapPairs(xTuple, yTuple, (x, y) => {
            
            if (isNothing(x)) return null;
            if (isNothing(y)) throw new Error(`Exponentiation operation not defined between ${detectItemType(x)} and NOTHING`);

            const xType = detectItemType(x);
            const yType = detectItemType(y);
            switch (`${xType},${yType}`) {
                case "Number,Number" : return x ** y;
                default              : throw new Error(`Exponentiation operation not defined between ${xType} and ${yType}`);
            }
            
        });
    },

    async $eq (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return isSameTuple(x, y);
    },

    async $ne (X, Y) {
        return !(await this.$eq(X, Y));
    },

    async $lt (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return compareTuples(x, y) < 0;
    },

    async $ge (X, Y) {
        return !(await this.$lt(X, Y));
    },

    async $gt (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return compareTuples(x, y) > 0;
    },

    async $le (X, Y) {
        return !(await this.$gt(X, Y));
    },
    

    // BUILT-IN CONSTANTS
    
    TRUE: true,
    FALSE: false,


    // BUILT-IN FUNCTIONS
    
    quit (...args) {
        throw new QuitError(...Tuple(...args));
    },
    
    try (func, ...errorHandlers) {
        return async (...args) => {
            try {
                const F = () => func;
                const X = () => Tuple(...args);
                return await this.$apply(F, X);
            } catch (error) {
                if (errorHandlers.length === 0) throw error;
                return await this.try(...errorHandlers)(...Tuple(error.args));
            }
        }
    },
    
    bool (...items) {
        for (let item of Tuple(...items)) {
            if (convertItemToBoolean(item) !== false) return true;
        }
        return false;
    },
    
    not (...items) {
        return !this.bool(...items);
    },
    
    str (...items) {
        let string = "";
        for (let item of Tuple(...items)) {
            string += convertItemToString(item);
        }
        return string;
    },
    
    enum (...items) {
        return Tuple(...items).mapAsync(async item => {
            
            const itemType = detectItemType(item);
            switch (itemType) {
                case "Number"   : return Tuple(...aritmeticSequence1(item));
                case "String"   : return Tuple(...item);
                case "List"     : return Tuple(...item);
                case "Namespace": return Tuple(...listNamespaceNames(item));
                default         : throw new Error(`${itemType} is not enumerable.`);
            }
            
        }).then(tuple => tuple.normalize());
    },
    
    type (...items) {
        return Tuple(...items).mapSync(detectItemType).normalize();
    },
    
    size (...items) {
        return Tuple(...items).mapSync(item => {
            
            const itemType = detectItemType(item);
            switch (itemType) {
                case "String"   : return item.length;
                case "List"     : return item.length;
                case "Namespace": return countNamespaceNames(item);
                default         : throw new Error(`Size not defined for ${itemType} type.`);
            }
            
        }).normalize();
    },
    
    
    // CONTEXT MANUPULATION
    
    $assign (namespace={}) {
        for (let name in namespace) {
            this[name] = namespace[name];
        }
        return this;
    },

    $extend (namespace={}) {
        return Object.create(this).$assign(namespace);
    }    
};

const serializationContext = {

    $nothing () {
        return "()";
    },

    async $str0 (text) {
        return "`" + text + "`";
    },

    $str1 (value) {
        return `'${value}'`;
    },

    $str2 (value) {
        return `"${value}"`;
    },

    $str3 (value) {
        return '`' + value + '`';
    },

    $numb (value) {
        return String(value);
    },

    async $pair (X, Y) {
        return `${await X(this)}, ${await Y(this)}`
    },

    async $list (X) {
        return `[${await X(this)}]`;
    },

    $name (name) {
        return name;
    },

    async $label (X, Y) {
        return `(${await X(this)}: ${await Y(this)})`;
    },

    async $set (X, Y) {
        return `(${await X(this)} = ${await Y(this)})`;
    },

    async $namespace (X) {
        return `{${await X(this)}}`;
    },

    async $def (params, expression) {
        return `((${await params(this)})->${await expression(this)})`;
    },

    async $apply (X, Y) {
        return `(${await X(this)}(${await Y(this)}))`;
    },

    async $dot (X, Y) {
        return `(${await X(this)}.${await Y(this)})`;
    },

    async $or (X, Y) {
        return `(${await X(this)}|${await Y(this)})`;
    },

    async $and (X, Y) {
        return `(${await X(this)})&(${await Y(this)})`;
    },

    async $if (X, Y) {
        return `(${await X(this)}?${await Y(this)})`;
    },

    async $else (X, Y) {
        return `(${await X(this)};${await Y(this)})`;
    },

    async $add (X, Y) {
        return `(${await X(this)}+${await Y(this)})`;
    },

    async $sub (X, Y) {
        return `(${await X(this)}-${await Y(this)})`;
    },

    async $mul (X, Y) {
        return `(${await X(this)}*${await Y(this)})`;
    },

    async $div (X, Y) {
        return `(${await X(this)}/${await Y(this)})`;
    },

    async $mod (X, Y) {
        return `(${await X(this)}%${await Y(this)})`;
    },

    async $pow (X, Y) {
        return `(${await X(this)}^${await Y(this)})`;
    },

    async $eq (X, Y) {
        return `(${await X(this)}==${await Y(this)})`;
    },

    async $ne (X, Y) {
        return `(${await X(this)}!=${await Y(this)})`;
    },

    async $lt (X, Y) {
        return `(${await X(this)}<${await Y(this)})`;
    },

    async $ge (X, Y) {
        return `(${await X(this)}>=${await Y(this)})`;
    },

    async $gt (X, Y) {
        return `(${await X(this)}>${await Y(this)})`;
    },

    async $le (X, Y) {
        return `(${await X(this)}<=${await Y(this)})`;
    },

    async $compose (X, Y) {
        return `(${await X(this)}<<${await Y(this)})`;
    },

    async $pipe (X, Y) {
        return `(${await X(this)}>>${await Y(this)})`;
    }
}



// -----------------------------------------------------------------------------
//  EXPORTS
// -----------------------------------------------------------------------------

module.exports = {Tuple, Failure, parse, context};