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

exports.type = x => types.wrap(x).imapSync(X => X.typeName).unwrap();

exports.range = n => {
    if (types.wrap(n) instanceof types.Numb) {
        let range = new types.Tuple();
        for (let i=0; i<n; i++) {
            range = new types.Tuple(range, i);
        }
        return range;
    } else {
        return new types.Undefined("Tuple");
    }
}

exports.undefined = (type, ...args) => new types.Undefined(type, ...args);
