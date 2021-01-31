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
            const xpStr = await F.str(xpVal);
            value = value.replace("${" + i + "}", xpStr);
        }
        return value;
    },

    $numb (value) {
        return value;
    },

    $error (error) {
        throw error;
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
        const func = async (...args) => {
            const functionContext = Object.create(this);
            await functionContext.$set(params, () => T.createTuple(...args));
            return await expression(functionContext);
        }
        func.toSource = async () => `((${await params(serializationContext)})->${await expression(serializationContext)})`;
        return func;
    },

    async $apply (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        try {
            return await O.apply.call(this, x, y);
        } catch (parentError) {
            const error = new Error(parentError.message);
            error.parent = parentError;
            throw error;
        }
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


// Context used to un-parse a compiled expression back to its source
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
        try {
            const value = await evaluate(expressionContext);
            return T.isNothing(value) ? null : value;
        } catch (error) {
            error.swanStack = buildErrorStack(error);
            throw error;
        }
    }
}

function buildErrorStack (error) {
    if (error instanceof Error && error.location) {
        const lines = error.location.source.split('\n');
        let row=0, col=error.location.position;
        while (col > lines[row].length) {
            col = col - lines[row].length -1;
            row = row + 1;
        }
        return `@ ${lines[row]}\n  ${' '.repeat(col)}^\n` + buildErrorStack(error.parent);
    } else {
        return "";
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
const expression_globals = {
    'require': require('./lib/lib-loader').require
};
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
