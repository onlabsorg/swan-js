/**
 *  swan
 *  ============================================================================
 *  The swan JavaScript API include a `parse` function and a `createContext` 
 *  function. The parse function compiles an expression string to a function that
 *  takes a context (created with `createdContext`) and asynchronously returns
 *  the expression value.
 *  
 *  Example:
 *  ```js
 *  evaluate = swan.parse( "3 * x" );
 *  context = swan.createContext({x:10});
 *  value = await evaluate(context);         // 30
 *  ```
 */

const T = require("./lib/types");
const F = require('./lib/builtin-functions');
const O = require('./lib/binary-operations');




// -----------------------------------------------------------------------------
//  PARSER
// -----------------------------------------------------------------------------

const Parser = require("./lib/parser");

const parse = Parser({
     
     binaryOperations: {
         ","  : {precedence:10, handler:"$pair"    },
         "<<" : {precedence:11, handler:"$compose" },
         ">>" : {precedence:11, handler:"$pipe"    },
         ":"  : {precedence:12, handler:"$label"   },
         "="  : {precedence:12, handler:"$set"     },
         "->" : {precedence:13, handler:"$def",  right:true},

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
     stringHandler0     : "$str0",
     stringHandler1     : "$str1",
     stringHandler2     : "$str2",
     numberHandler      : "$numb",
     squareGroupHandler : "$list",
     curlyGroupHandler  : "$namespace",
});





// -----------------------------------------------------------------------------
//  CONTEXT
// -----------------------------------------------------------------------------

const context = {
    
    $nothing () {
        return null;
    },
    
    async $str0 (text) {
        const parsedExpressions = [];
        text = text.replace(/\$\{([\s\S]+?)\}/g, (match, expressionSource) => {  
            let i = parsedExpressions.length;
            parsedExpressions.push( parse(expressionSource) );
            return "${"+i+"}";
        }); 
        
        const templateContext = Object.create(this);
        for (let i=0; i<parsedExpressions.length; i++) {
            let evaluateExpression = parsedExpressions[i];
            let value = await evaluateExpression(templateContext);                
            text = text.replace("${"+i+"}", await this.str(...T.iter(value)));
        }

        return text;
    },
    
    $str1 (value) {
        return value;
    },
    
    $str2 (value) {
        return value;
    },
    
    $numb (value) {
        return value;
    },
    
    async $pair (X, Y) {
        return O.pair(await X(this), await Y(this));
    },
        
    async $list (X) {
        const x = await X(this);
        return Array.from(T.iter(x));
    },
    
    async $name (name) {
        if (T.isName(name)) {
            let value = this[name];
            if (value !== undefined && value !== Object.prototype[name]) return value;
        }
        return null;
    },
    
    async $label (X, Y) {
        const x = await X({
            $nothing: this.$nothing,
            $name: name => name,
            $pair: this.$pair
        });
        const names = Array.from(T.iter(x));
        const y = await Y(this);
        const values = Array.from(T.iter(y));
        if (values.length > names.length) {
            values[names.length-1] = T.createTuple(...values.slice(names.length-1))
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
        return async (...args) => {
            const functionContext = Object.create(this);
            await functionContext.$set(params, () => T.createTuple(...args));
            return await expression(functionContext);
        }
    },
    
    async $apply (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await O.apply.call(this, x, y);
    },
    
    async $dot (X, Y) {
        const namespace = await X(this);
        if (!T.isNamespace(namespace)) {
            return F.error("Namespace expected on the left side of the '.' operator");
        }
        const childNamespace = this.$extend(namespace);
        return await Y(childNamespace);
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
        return T.isNothing(x) ? await Y(this) : x;
    },
    
    async $add (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await O.add(x, y);
    },

    async $sub (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await O.sub(x, y);
    },

    async $mul (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await O.mul(x, y);
    },

    async $div (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await O.div(x, y);
    },

    async $mod (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await O.mod(x, y);
    },

    async $pow (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await O.pow(x, y);
    },

    async $eq (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return O.equal(x, y);
    },
     
    async $ne (X, Y) {
        return !(await this.$eq(X, Y));
    },

    async $lt (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await O.compare(x, y) === -1;
    },

    async $ge (X, Y) {
        return !(await this.$lt(X, Y));
    },

    async $gt (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await O.compare(x, y) == +1;
    },

    async $le (X, Y) {
        return !(await this.$gt(X, Y));
    },   
    
    async $compose (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return O.compose(x, y);
    },

    async $pipe (X, Y) {
        return await this.$compose(Y, X);
    },
    
    TRUE: true,
    FALSE: false,
    
    $assign (namespace) {
        for (let name in namespace) {
            this[name] = namespace[name];
        }
        return this;
    },
    
    $extend (namespace) {
        return Object.create(this).$assign(namespace);
    }
};

// Add the built-in functions to the base context
for (let fname in F) {
    context[fname] = async function (...items) {
        const x = T.createTuple(...items);
        return await F[fname](x);
    }
}





// -----------------------------------------------------------------------------
//  EXPORTS
// -----------------------------------------------------------------------------


/**
 *  swan.parse - function
 *  ----------------------------------------------------------------------------
 *  Parses a swan expression and returns a function that maps a context to an
 *  expression value.
 *
 *  ```js
 *  evaluate = swan.parse(expression);
 *  value = await evaluate(context);
 *  ```
 *  
 *  - `espression` is a string containing any valid swan expression
 *  - `context` is a valid swan expression context
 *  - `value` is the value that expression result has in the given context
 */
exports.parse = (expression) => {
    const evaluate = parse(expression);
    return async (expressionContext) => {
        if (!context.isPrototypeOf(expressionContext)) {
            throw new Error("Invalid context.")
        };
        const value = await evaluate(expressionContext);
        return T.isNothing(value) ? null : value;
    }
}


/**
 *  swan.createContext - function
 *  ----------------------------------------------------------------------------
 *  Creates a valid expression context.
 *  
 *  ```js
 *  context = swan.createContext(...namespaces)
 *  ```
 *  
 *  - `namespaces` is a list of objects `ns1, ns2, ns3, ...` that will be merged
 *    to the core swan context 
 *  - `context` is an object containing all the core context properties, plus 
 *    all the properties of the passed namespace, added in order.
 */
const expression_globals = {};
exports.createContext = (...namespaces) => {
    var ctx = context.$extend(expression_globals);
    for (let namespace of namespaces) {
        ctx = ctx.$extend(namespace);
    }
    return ctx;
}


/**
 *  Internals
 *  ----------------------------------------------------------------------------
 *  - `swan.T` is an object containing types-realted functions.
 *  - `swan.F` is an object exposing to JavaScript the swan built-in functions
 *  - `swan.O` is an object exposing to JavaScript the swan binary operations
 */
 exports.T = T;
 exports.F = F;
 exports.O = O;
