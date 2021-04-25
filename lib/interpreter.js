/**
 *  SWAN INTERPRETER MODULE
 *  ============================================================================
 *   
 *  This module exposes a `parse` function that takes a text containin a swan 
 *  expression and returns an `evaluate` function that, once run returns the 
 *  value of the original expression.
 *  
 *      evaluate = interpreter.parse("2 + 3 * 4");
 *     value = await evaluate(context);    // -> 24
 *  
 *  The context object passed to the `evaluate` function must have 
 *  `interpreter.context` as prototype. 
 *  
 *     context = interpreter.context.$extend({pi:3.14, double: x => 2*x})
 *  
 *  All the properties added to the context (e.g. `pi` and `double` in the 
 *  example above) can be referenced in the expression.
 *
 *  ----------------------------------------------------------------------------
 *  
 *  Besides the two core exports `interpreter.parse` and `interpreter.context`,
 *  this module exports also the following two calsses:
 *  
 *  - interpreter.Tuple
 *  - interpreter.Undefined
 *  
 *  Tuple and Undefined are the only two swan type that do not already exist in 
 *  javascript.
 *  
 *  `Tuple` is the swan product type (item1, item2, ...). The elements of a tuple 
 *  are called `items`. Each item can also be seen as a tuple made of only one
 *  element. Tuples are flattened, therefore a tuple cannot contain nested tuples; 
 *  in other words, the tuple (i1, (i2, i3), i4) is equivalent to the tuple 
 *  (i1, i2, i3, i4).
 *  
 *  The empty tuple () is the unit type of swan and it is used to represent 
 *  the concept of nothingness. It is therefore also called `NOTHING`.
 *  
 *  `Undefined` is the value an expression returns when the results of the 
 *  expression is not defined. For example the division of number by NOTHING is 
 *  not defined in swan, therefore the expression `3 / ()` will return an 
 *  instance of undefined.
 *  
 *  swan doesn't have the concept of Exception: where other languages throw an
 *  exception, swan returns an Undefined value. The Undefined objects contain 
 *  also information that can help the swan user to trace back the origin of the 
 *  undefined value (think at it as a sort of error stack).
 *  
 *  ----------------------------------------------------------------------------
 *
 *  Besides the Tuple product type and the Undefined item type, swan has the
 *  following item types. Each of them corresponds to a JavaScript type.
 *  
 *  - Boolean       (equivalent to the JavaScript Boolean type)
 *  - Number        (equivalent to the JavaScript Number type)
 *  - String        (equivalent to the JavaScript String type)
 *  - List          (equivalent to the JavaScript Array type)
 *  - Namespace     (equivalent to the JavaScript Object type)
 *  - Function      (equivalent to the JavaScript Function type)
 */





// -----------------------------------------------------------------------------
//  TYPE DETECTION
// -----------------------------------------------------------------------------

// This function takes an item as input and returns its type name
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
    
    // if undefined
    if (item instanceof Undefined) return "Undefined";
    
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

// The following functions return true or false if the passed item matches a certain type
const isNothing = x => x === null || x === undefined || Number.isNaN(x);
const isBoolean = x => typeof x === 'boolean' || (typeof x === 'object' && Object.prototype.toString.call(x) === '[object Boolean]')
const isNumber = x => typeof x === 'number' || (typeof x === 'object' && Object.prototype.toString.call(x) === '[object Number]')
const isFunction = x => typeof x === 'function' || (typeof x === 'object' && Object.prototype.toString.call(x) === '[object Function]')
const isString = x => typeof x === 'string' || (typeof x === 'object' && Object.prototype.toString.call(x) === '[object String]');
const isList = x => x && Array.isArray(x);
const isNamespace = x => detectItemType(x) === 'Namespace';

// The following function checks if a string is a valid swan identifier
const isName = x => isString(x) && /^[a-z_A-Z]+[a-z_A-Z0-9]*$/.test(x);

// This function takes two items as input and returns the concatenation of 
// their type names. For example `detectType(1,[])` returns "Number,List".
// This is mostly used by binary operation handlers to decide at runtime how
// to reduce the two operators, based on their type.
function detectPairType (value1, value2) {
    return `${detectItemType(value1)},${detectItemType(value2)}`;
}





// -----------------------------------------------------------------------------
//  TYPE CASTING
// -----------------------------------------------------------------------------

// This functions defines the boolean type casting behaviour of swan
function convertItemToBoolean (item) {
    switch (detectItemType(item)) {
        
        case "Boolean"  : return item;                              // A boolean is already a boolean
        case "Number"   : return item !== 0;                        // A number is false only if it is 0
        case "String"   : return item !== "";                       // A string is false only if it is empty
        case "List"     : return item.length !== 0;                 // A list is false only if it is empty
        case "Namespace": return countNamespaceNames(item) !== 0;   // A namespace is false only if it is empty
        case "Function" : return true;                              // A function is always true
        
        // The following should never run!
        default         : throw new Error(`Cannot convert ${item} to boolean`);
    }                
}





// -----------------------------------------------------------------------------
//  TUPLES
// -----------------------------------------------------------------------------

// Shortcut for `new TupleObject`. In addition to that, this function will not
// create a new tuple if the passed parameter is already a TupleObject.
function Tuple (...items) {
    if (items.length === 1 && items[0] instanceof TupleObject) return items[0];
    return new TupleObject(...items);
}

// This class defines the behaviour of a the swan product type. Since every
// value in swan is a Tuple, this class is very important and you see it used
// a lot in this module.
class TupleObject {

    // Creates an Tuple instance given a sequence of values. The passed values
    // can items and/or tuples. The iterator function will take care of flattening
    // the tuple, so that `new TupleObject(a, new TupleObject(b, c))` is
    // equivalent to `new TupleObject(a, b, c)`.
    constructor (...items) {
        this._items = items;
    }
    
    // Yields one by one all the items contained in the tuple instance, flattening
    // nested tuple. In particular, NOTHING values are ignored, because (a,(),b) 
    // should consistently be flattened to (a,b).
    *[Symbol.iterator] () {
        for (let item of this._items) {
            if (item instanceof this.constructor) {
                for (let subItem of item) yield subItem;
            } else if (!isNothing(item)) {
                yield item;
            }
        }
    }
    
    // This method returns true if the Tuple instance has no elements
    isEmpty () {
        let iterator = this[Symbol.iterator]();
        let first = iterator.next();
        return first.done;
    }
    
    // Applies synchronously the passed function to each item of this tuple
    // and returns the resulting tuple.
    mapSync (f) {
        let image = new this.constructor();
        for (let item of this) {
            image = new this.constructor(image, f(item));
        }
        return image;
    }

    // Applies asynchronously the passed function to each item of this tuple
    // and returns the resulting tuple.
    async mapAsync (f) {
        let image = new this.constructor();
        for (let item of this) {
            image = new this.constructor(image, await f(item));
        }
        return image;
    }
    
    // If this tuple is empty it returns `null` (JavaScript equivalent to NOTHING);
    // if this tuple contains only one item, it returns the tuple;
    // if this tuple contains two or more items, it returns this tuple itself.
    normalize () {
        let iterator = this[Symbol.iterator]();
        let first = iterator.next();
        if (first.done) return null;
        return iterator.next().done ? first.value : this;
    }
}

// Make sure that a tuple created with the Tuple function is recognized as
// `instanceof` the Tuple function.
Tuple.prototype = TupleObject.prototype;

// This function takes two tuples (x1, x2, ...) and (y1, y2, ...) as argument
// and yields the pairs [x1, y1], [x2, y2], etc. If one of the tuples is
// shorter that the other, the missing items are replaced by null (NOTHING).
// For example (x1, x2, x3) and (y1, y2) pair to [x1,y1], [x2,y2], [x3,null].
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

// This function takes two tuples (x1, x2, ...) and (y1, y2, ...) as argument
// and returns the tuple (map(x1,y1), map(x2,y2), ...).
// This function is often used by binary operation which normally operates on
// each pair individually; for example (x1,x2) + (y1,y2) = (x1+y1, x2+y2).
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
//  A swan namespace is a subset of a JavaScript object. The keys are called
//  `names` and all the keys that are not valid identifiers (see isName function),
//  are ignored.
// -----------------------------------------------------------------------------

// This function returns an array of all the valid names contained in the 
// passed namespace.
function listNamespaceNames (namespace) {
    const names = [];
    for (let name in namespace) {
        if (isName(name)) names.push(name);
    }
    return names;
}

// This function returns the number of valid names contained in the passed
// namespace.
function countNamespaceNames (namespace) {
    let count = 0;
    for (let name in namespace) {
        if (isName(name)) count++;
    }
    return count;
}

// This function returns the value mapped to the given name in the given
// namespace. If the name doesn't exist or it is not a valid name, it returns
// null (NOTHING). If the name is a core JavaScript Object name, it also
// returns null (NOTHING); this behaviour is meant to sandbox swan.
function getNamespaceAttribute (namespace, name) {
    if (!isName(name)) return null;
    const value = namespace[name];
    return (value !== undefined && value !== Object.prototype[name]) ? value : null;
}





// -----------------------------------------------------------------------------
//  SEQUENCES
// -----------------------------------------------------------------------------
//  The following functions help manipulate Strings and Lists (Arrays)
// -----------------------------------------------------------------------------

// Given a sequence (String or List) and a number, it returns the corresponding
// character (if a String) or item (if a List). This function accept negative
// indexes and consider them as relative to the length of the sequence.
// If the index is out of range, the given defaultValue is returned.
function getSequenceItem (sequence, index, defaultValue) {
    if (!isNumber(index)) return defaultValue;
    index = index < 0 ? sequence.length + index : index;
    return (0 <= index && index < sequence.length) ? sequence[Math.trunc(index)] : defaultValue;
}

// This function implements the JavaScript String.prototype.repeat on lists.
function repeatList (list, n) {
    var product = [];
    for (let i=1; i<=n; i++) product = product.concat(list);
    return product;    
}





// -----------------------------------------------------------------------------
//  NUMBERS
// -----------------------------------------------------------------------------

// This function returns the list of integers between 0 and n.
function* aritmeticSequence1 (n) {
    if (n > 0) {
        for (let i=0; i<n; i++) yield i;
    } else if (n < 0) {
        for (let i=0; i>n; i--) yield i;
    }
}





// -----------------------------------------------------------------------------
//  UNDEFINED
// -----------------------------------------------------------------------------

// The swan undefined data type is used as a result value of operations that are 
// not defined. For example `10 < "abc"` returns an Undefined instance.
// Swan does not implement Error/Exceptions; where other languages would throw
// an exception, swan returns an Undefined value.
// In order to not loose information, any Undefined instance contains the name
// of the undefined operation and all its operands. These informations allow
// to trace back the source of an chain of undefined operations.
class Undefined {
    
    // The constructor accepts as parameters the name of the undefined operation
    // and all the operator values.
    constructor (...args) {
        this.args = Tuple(...args);

        // the location property is set by the `context.undefined` function and
        // contains information about the position of the failing operation in
        // the source code. Useful for debugging undesired undefined values.
        this.location = {};
    }
    
    // Returns the line of code that contains the operation that returns this
    // undefined instance
    get line () {
        return this.location.line || "";
    }
    
    // Returns the row number of the code line that contains the operation that 
    // returns this undefined instance
    get row () {
        return this.location.row || 0;
    }
    
    // Returns the column number of the code line that contains the operation 
    // that returns this undefined instance
    get column () {
        return this.location.column || 0;
    }
        
    // By default it returns the instance description. This function is used
    // by swan to serialize undefined values. The user of this library may
    // customize this function to change the way undefined values are rendered.
    toString () {
        return "[[Undefined]]";
    }
}





// -----------------------------------------------------------------------------
//  COMPARISON
// -----------------------------------------------------------------------------

// Returns true if two tuples have the same items (uses isSameItem function).
function isSameTuple (tuple1, tuple2) {
    for (let [item1, item2] of iterPairs(tuple1, tuple2)) {
        if (!isSameItem(item1, item2)) return false;
    }
    return true;
}

// Runs a deep comparison of the two namespaces and returns true if the two
// namespaces have the same items. Non-valid names are ignored.
function isSameNamespace (namespace1, namespace2) {
    const nameList1 = listNamespaceNames(namespace1);   // only valid names
    const nameList2 = listNamespaceNames(namespace2);   // only valid names
    if (nameList1.length !== nameList2.length) return false;
    for (let name of nameList1) {
        const value1 = getNamespaceAttribute(namespace1, name);
        const value2 = getNamespaceAttribute(namespace2, name);
        if (!isSameTuple(value1, value2)) return false;     // in the most general case, the two items are tuples
    }
    return true;
}

// Returns true if two items are equal. This function defined the swan
// concept of item equality.
function isSameItem (item1, item2) {
    
    // NOTHING is equal only to itself
    if (isNothing(item1) && !isNothing(item2)) return false;
    if (isNothing(item2)) return false;    
    
    switch (detectPairType(item1, item2)) {
        case "List,List"          : return isSameList(item1, item2);        // lists are equal if all their items are equal
        case "Namespace,Namespace": return isSameNamespace(item1, item2);   // namespaces are equal if all their items are equal
        default                   : return item1 === item2;                 // all the other item types are equal according to the JavaScript definition of equality
    }    
}

// Returns true if the two lists have the same items
function isSameList (list1, list2) {
    if (list1.length !== list2.length) return false;
    for (let i=0; i<list1.length; i++) {
        if(!isSameTuple(list1[i], list2[i])) return false;
    }
    return true;
}

// Runs a lexicographycal comparison of the two tuples and returns 
// -1 (for <), 0 (for ==) or +1 (for >).
function compareTuples (tuple1, tuple2) {
    for (let [item1, item2] of iterPairs(tuple1, tuple2)) {
        let cmp = compareItems(item1, item2);
        if (cmp !== 0) return cmp;
    }
    return 0;   
}

// Compare two items and returns -1 (for <), 0 (for ==) or +1 (for >).
// It throws an exception if the comparison is not defined. This exception will
// be catched and turned into an Undefined instance.
function compareItems (item1, item2) {
    
    // NOTHING is equal to itself and less than anything else
    if (isNothing(item1)) return isNothing(item2) ? 0 : -1;
    if (isNothing(item2)) return +1;
    
    switch (detectPairType(item1, item2)) {
        case "Boolean,Boolean": return item1 === item2 ? 0 : (item1 ? +1 : -1);         // FALSE == FALSE < TRUE == TRUE
        case "Number,Number"  : return item1 === item2 ? 0 : (item1<item2 ? -1 : +1);   // As per JavaScript number comparison
        case "String,String"  : return item1.localeCompare(item2);                      // Alphabetical comparison
        case "List,List"      : return lexCompareLists(item1, item2);                   // Lexicographical comparison
        
        // this exception will be catched by the proper context handler and turned into an Undefined instance
        default               : throw new Error(`Comparison operation not defined`);        
    }    
}

// Runs a lexicographycal comparison of the two lists and returns 
//  -1 if tuple1 < tuple2; 
//  +1 if tuple1 > tuple2; 
//  0 if tuple1 == tuple2.
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
// The `parse` function takes a swan expression string as input and returns an 
// `evaluate` function as output.
//
// The `evaluate` function takes a context object as input and returns the value 
// of the swan expression as output. The evaluation of each single operation
// is delegated to a handler attached to the context object. The handlers
// names are defined in the configuration parameter passed to the `Parser`
// factory. For example the `*` operation is handled by `context.$mul`.
//
// Each handler gets called with two parameters (for binary operations) or with
// one parameter (for non-binary operations). Each parameter is an evaluate
// function that returns an operand. For example, in the expression "(3+2)*(5-1)",
// the `evaluate` function will return `context.$mul(X,Y)`, where: 
//  `X` is a function that takes `context` as argument and returns `(3+2)`;
//  `Y` is a function that takes `context` as argument and returns `(5-1)`.
//
// More details about the parser can be found in the `parser` module.
// -----------------------------------------------------------------------------

const Parser = require("./parser");

const parse = Parser({

     binaryOperations: {
         ","  : {precedence:10, handler:"$pair"    },
         ":"  : {precedence:12, handler:"$label"   },
         "="  : {precedence:12, handler:"$set"     },
         "=>" : {precedence:13, handler:"$tmap"    },
         "?>" : {precedence:13, handler:"$umap"   },
         ">>" : {precedence:14, handler:"$pipe" },
         "<<" : {precedence:14, handler:"$compose", right:true},
         "->" : {precedence:15, handler:"$def",     right:true},

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
         "@"  : {precedence:30, handler:"$at" },
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

    
    //:::  CORE HANDLERS  ::::::::::::::::::::::::::::::::::::::::::::::::::::::

    // Nothing value handler
    $nothing () {
        return null;
    },

    // Single quote string value handler
    $str1 (value) {
        return value;
    },

    // Double quote string value handler
    $str2 (value) {
        return value;
    },

    // Template string handler
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

    // Numeric value handler
    $numb (value) {
        return value;
    },
    
    // Pairing operation handler: X,Y
    async $pair (X, Y) {
        return Tuple(await X(this), await Y(this));
    },

    // Square brackets grouping handler: [X]
    async $list (X) {
        const x = await X(this);
        return Array.from(Tuple(x));
    },

    // Identifier handler
    async $name (name) {
        return getNamespaceAttribute(this, name);
    },

    // Labelling operation handler: X: Y
    async $label (X, Y) {
        const x = await X({
            $$parser: this.$$parser,
            $nothing: this.$nothing,
            $name: name => name,
            $pair: this.$pair,
            $error: error => this.$error(error)
        });
        const names = Array.from(Tuple(x)).filter(isName);

        const y = await Y(this);        
        const values = Array.from(Tuple(y));
        
        if (values.length > names.length) {
            values[names.length-1] = Tuple(...values.slice(names.length-1)).normalize();
        }
        for (var i=0; i<names.length; i++) {
            this[names[i]] = i < values.length ? values[i] : null;
        }    
        
        return y;
    },

    // Assignment handler: X = Y
    async $set (X, Y) {
        await this.$label(X, Y);
        return null;
    },

    // Curly braces grouping handler: {X}
    async $namespace (X) {
        const context = Object.create(this);
        await X(context);
        return Object.assign({}, context);
    },

    // Function definition operation handler: X -> Y
    $def (params, expression) {
        return async (...args) => {
            const functionContext = Object.create(this);
            await functionContext.$set(params, () => Tuple(...args).normalize());
            return await expression(functionContext);
        }
    },
    
    // Application operation handler: X Y
    async $apply (F, X) {
        const f = await F(this);
        const x = Tuple(await X(this));
        
        return await Tuple(f).mapAsync(async fItem => {
            
            switch (detectItemType(fItem)) {
                
                case "Function":
                    try {
                        return await fItem.call(this, ...x);
                    } catch (error) {
                        return await this.$error(error);
                    }    
                    
                case "Namespace":
                    if (isFunction(fItem.__apply__)) {
                        try {
                            return await fItem.__apply__.call(this, ...x);
                        } catch (error) {
                            return await this.$error(error);
                        }                            
                    }
                
                default:
                    return this.undefined('application', fItem);
            }
        }).then(tuple => tuple.normalize());
    },

    // Referencing operation handler: X @ Y
    async $at (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        
        return await Tuple(x).mapAsync(async xItem => {
            
            const xItemType = detectItemType(xItem);
            switch (xItemType) {
                case "Namespace": return Tuple(y).mapSync(name => getNamespaceAttribute(xItem, name)).normalize();
                case "List"     : return Tuple(y).mapSync(i => getSequenceItem(xItem, i, null)).normalize();
                case "String"   : return Tuple(y).mapSync(i => getSequenceItem(xItem, i, "")).normalize();
                default         : return this.undefined('referencing', xItem, y);
            }
            
        }).then(tuple => tuple.normalize());
    },

    // Mapping operation handler: X => Y
    async $tmap (X, F) {
        const x = await X(this);
        return await Tuple(x)
                .mapAsync(item => this.$apply(F, ()=>item))
                .then(tuple => tuple.normalize());
    },

    // Selective undefined mapping operation handler: X ?> Y
    async $umap (X, F) {
        const x = await X(this);
        return await Tuple(x).mapAsync(async item => {
            if (item instanceof Undefined) {
                return await this.$apply(F, () => Tuple(...item.args));
            } else {
                return item;
            }
        }).then(tuple => tuple.normalize());
    },
    
    // Subcontexting operation handler: X.Y
    async $dot (X, Y) {
        const x = await X(this);
        return await Tuple(x).mapAsync(async xItem => {
            
            if (!isNamespace(xItem)) {
                return this.undefined('subcontexting', xItem);
            }
            const childNamespace = this.$extend(xItem);
            return await Y(childNamespace);
            
        }).then(tuple => tuple.normalize());
    },
    
    // Hanldes all errors occurring during evaluation
    $error (error) {
        return this.undefined('failure', error);
    },



    //:::  LOGIC OPERATION HANDLERS  :::::::::::::::::::::::::::::::::::::::::::

    // OR operation handler: X | Y
    async $or (X, Y) {
        const x = await X(this);
        const bool_x = await this.bool(x);
        if (bool_x instanceof Undefined) return bool_x;
        return bool_x ? x : await Y(this);
    },

    // AND operation handler: X & Y
    async $and (X, Y) {
        const x = await X(this);
        const bool_x = await this.bool(x);
        if (bool_x instanceof Undefined) return bool_x;
        return bool_x ? await Y(this) : x;
    },

    // Conditional operation handler: X ? Y
    async $if (X, Y) {
        const x = await X(this);
        const bool_x = await this.bool(x);
        if (bool_x instanceof Undefined) return bool_x;
        return bool_x ? await Y(this) : null;
    },

    // Alternative operation handler: X ; Y
    async $else (X, Y) {
        const x = await X(this);
        return Tuple(x).isEmpty() ? await Y(this) : x;
    },



    //:::  ARITHMETIC OPERATION HANDLERS  ::::::::::::::::::::::::::::::::::::::
    
    // Sum operation handler: X + Y
    async $add (X, Y) {
        const xTuple = await X(this);
        const yTuple = await Y(this);
        return await mapPairs(xTuple, yTuple, (x, y) => {
            if (isNothing(x)) return y;
            if (isNothing(y)) return x;
            switch (detectPairType(x, y)) {
                case "Boolean,Boolean"    : return x || y;
                case "Number,Number"      : return x + y;
                case "String,String"      : return x + y;
                case "List,List"          : return x.concat(y);
                case "Namespace,Namespace": return Object.assign({}, x, y);
                default                   : return this.undefined('sum', x, y);
            }
        });
    },

    // Subtraction operation handler: X - Y
    async $sub (X, Y) {
        const xTuple = await X(this);
        const yTuple = await Y(this);
        return await mapPairs(xTuple, yTuple, (x, y) => {
            if (isNothing(y)) return x;
            switch (detectPairType(x, y)) {
                case "Number,Number" : return x - y;
                default              : return this.undefined('subtraction', x, y);
            }
        });
    },

    // Product operation handler: X * Y
    async $mul (X, Y) {
        const xTuple = await X(this);
        const yTuple = await Y(this);
        return await mapPairs(xTuple, yTuple, (x, y) => {
            if (isNothing(x)) return null;
            if (isNothing(y)) return null;
            switch (detectPairType(x, y)) {
                case "Boolean,Boolean"    : return x && y;
                case "Number,Number"      : return x * y;
                case "Number,String"      : return x < 0 ? "" : y.repeat(x);
                case "String,Number"      : return y < 0 ? "" : x.repeat(y);
                case "Number,List"        : return repeatList(y, x);
                case "List,Number"        : return repeatList(x, y);
                default                   : return this.undefined('product', x, y);
            }
        });
    },

    // Division operation handler: X / Y
    async $div (X, Y) {
        const xTuple = await X(this);
        const yTuple = await Y(this);
        return await mapPairs(xTuple, yTuple, (x, y) => {
            if (isNothing(x)) return null;
            switch (detectPairType(x, y)) {
                case "Number,Number" : return x / y;
                default              : return this.undefined('division', x, y);
            }
        });
    },

    // Modulo operation handler: X % Y
    async $mod (X, Y) {
        const xTuple = await X(this);
        const yTuple = await Y(this);
        return await mapPairs(xTuple, yTuple, (x, y) => {
            if (isNothing(x)) return null;
            switch (detectPairType(x, y)) {
                case "Number,Number" : return x % y;
                default              : return this.undefined('modulo', x, y);
            }
        });
    },

    // Exponentiation operation handler: X ^ Y
    async $pow (X, Y) {
        const xTuple = await X(this);
        const yTuple = await Y(this);
        return await mapPairs(xTuple, yTuple, (x, y) => {
            if (isNothing(x)) return null;
            switch (detectPairType(x, y)) {
                case "Number,Number" : return x ** y;
                default              : return this.undefined('exponentiation', x, y);
            }
        });
    },
    

    
    //:::  COMPARISON OPERATION HANDLERS  ::::::::::::::::::::::::::::::::::::::

    // Equal: X == Y
    async $eq (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return isSameTuple(x, y);
    },

    // Not equal: X != Y
    async $ne (X, Y) {
        return !(await this.$eq(X, Y));
    },

    // Less than: X < Y
    async $lt (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        try {
            return compareTuples(x, y) < 0;
        } catch (error) {
            return this.undefined('comparison', x, y);
        }
    },

    // Greater than or equal to: X >= Y
    async $ge (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        try {
            return compareTuples(x, y) >= 0;
        } catch (error) {
            return this.undefined('comparison', x, y);
        }
    },

    // Greater than: X > Y
    async $gt (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        try {
            return compareTuples(x, y) > 0;
        } catch (error) {
            return this.undefined('comparison', x, y);
        }
    },

    // Less than or equal to: X < Y
    async $le (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        try {
            return compareTuples(x, y) <= 0;
        } catch (error) {
            return this.undefined('comparison', x, y);
        }
    },
    


    //:::  FUNCTION COMPOSITION  :::::::::::::::::::::::::::::::::::::::::::::::
    
    // Function composition operation handler: G << F
    $compose (G, F) {
        return (...args) => this.$apply(G, () => this.$apply(F, () => Tuple(...args)));
    },
    
    // Function piping operation handler: F >> G
    $pipe (F, G) {
        return this.$compose(G, F);
    },
    
    
    
    //:::  BUILT-IN CONSTANTS  :::::::::::::::::::::::::::::::::::::::::::::::::
    
    TRUE    : true,
    FALSE   : false,
    INFINITY: Infinity,



    //::: BUILT-IN FUNCTIONS  ::::::::::::::::::::::::::::::::::::::::::::::::::
    
    // Returns an Undefined instance
    undefined (...args) {
        const u = new Undefined(...args);
        if (this.$$parser) u.location = this.$$parser.getCurrentLocation();
        return u;
    },

    // Converts a tuple to boolean
    bool (...items) {
        for (let item of Tuple(...items)) {
            if (item instanceof Undefined) {
                return this.undefined('booleanization', item);
            }
            if (convertItemToBoolean(item) !== false) return true;
        }
        return false;
    },
    
    // Returns NOT bool(X)
    not (...items) {
        const bool = this.bool(...items);
        return bool instanceof Undefined ? bool : !bool;
    },
    
    // Converts a tuple to string
    str (...items) {
        return Array.from(Tuple(...items)).map(item => {
            
            switch (detectItemType(item)) {
                case "Boolean"  : return item ? "TRUE" : "FALSE";
                case "Number"   : return String(item);
                case "Function" : return "[[Function]]";
                case "String"   : return item;
                case "List"     : return `[[List of ${item.length} items]]`;
                case "Namespace": return isString(item.__str__) ? item.__str__ : `[[Namespace of ${countNamespaceNames(item)} items]]`;
                case "Undefined": return String(item);
                default         : return this.undefined("serialization", item);
            }
            
        }).join("");
    },
    
    // Enumerates an enumerable item
    enum (...items) {
        return Tuple(...items).mapAsync(async item => {
            
            switch (detectItemType(item)) {
                case "Number"   : return Tuple(...aritmeticSequence1(item));
                case "String"   : return Tuple(...item);
                case "List"     : return Tuple(...item);
                case "Namespace": return Tuple(...listNamespaceNames(item));
                default         : return this.undefined('enumeration', item);
            }
            
        }).then(tuple => tuple.normalize());
    },
    
    // Returns the type names of a tuble
    type (...items) {
        return Tuple(...items).mapSync(detectItemType).normalize();
    },
    
    // Returns the number of item of a container (String, List or Namespace)
    size (...items) {
        return Tuple(...items).mapSync(item => {
            
            switch (detectItemType(item)) {
                case "String"   : return item.length;
                case "List"     : return item.length;
                case "Namespace": return countNamespaceNames(item);
                default         : return this.undefined('size', item);
            }
            
        }).normalize();
    },
    
    
    
    //:::  CONTEXT PROPERTIES  :::::::::::::::::::::::::::::::::::::::::::::::::
    
    // Extends the current context with new names
    $extend (namespace={}) {
        const context = Object.create(this);
        for (let name in namespace) {
            context[name] = namespace[name];
        }
        return context;
    }
};





// -----------------------------------------------------------------------------
//  EXPORTS
// -----------------------------------------------------------------------------

module.exports = {Tuple, Undefined, parse, context};