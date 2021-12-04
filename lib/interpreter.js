const {Parser, ASTNode} = require('./parser');
const types = require('./types');





// -----------------------------------------------------------------------------
//  AST Node Types
//  ...
// -----------------------------------------------------------------------------

class BinaryOperation extends ASTNode {
    
    constructor (pos, operand1, operand2) {
        return super(pos, "binary-operation", null, operand1, operand2);
    }
    
    get operand1 () {
        return this.children[0];
    }
    
    get operand2 () {
        return this.children[1];
    }
    
    undefined (operand1, operand2) {
        return new types.Undefined(this.position, this.constructor.name, null, operand1, operand2)
    }
    
    evaluateInNameDomain () {
        const id1 = this.operand1.evaluateInNameDomain();
        const id2 = this.operand2.evaluateInNameDomain();
        return this.undefined(id1, id2);
    }
}

class UnaryOperation extends ASTNode {
    
    constructor (pos, value, operand) {
        return super(pos, "unary-operation", value, operand);
    }
    
    get operand () {
        return this.children[0];
    }
    
    undefined (operand) {
        return new types.Undefined(this.position, this.constructor.name, null, operand);
    }
    
    evaluateInNameDomain () {
        const id = this.operand.evaluateInNameDomain();        
        return this.undefined(id);
    }
}

class Leaf extends ASTNode {
    
    constructor (pos, value) {
        return super(pos, "literal", value);
    }

    undefined (value) {
        return new types.Undefined(this.position, this.constructor.name, value);
    }
    
    evaluateInNameDomain () {
        return this.undefined(this.value);
    }
    
    async evaluate (context={}) {
        return this.value;
    }
}





// -----------------------------------------------------------------------------
//  Core Operations
//  ...
// -----------------------------------------------------------------------------

class VoidLiteral extends Leaf {
    
    async evaluate (context) {
        return new types.Tuple();
    }
}

class NumberLiteral extends Leaf {
    
    async evaluate (context={}) {
        return new types.Numb(this.value);
    }
}

class StringLiteral extends Leaf {
    
    async evaluate (context={}) {
        return new types.Text(this.value);
    }
}

class StringTemplate extends UnaryOperation {}

class PairingOperation extends BinaryOperation {
    
    evaluateInNameDomain () {
        const id1 = this.operand1.evaluateInNameDomain();
        const id2 = this.operand2.evaluateInNameDomain();
        if (    (id1 instanceof types.Name || id1 instanceof types.Tuple) && 
                (id2 instanceof types.Name || id2 instanceof types.Tuple)) {
            return new types.Tuple(id1, id2);
        } else {
            return this.undefined(id1, id2);
        }
    }
    
    async evaluate (context) {
        const term1 = await this.operand1.evaluate(context);
        const term2 = await this.operand2.evaluate(context);
        return new types.Tuple(term1, term2);
    }
}

class ListDefinition extends UnaryOperation {
    
    async evaluate (context) {
        const term = await this.operand.evaluate(context);
        return new types.List(Array.from(term));
    }    
}

class NameReference extends UnaryOperation {
    
    evaluateInNameDomain () {
        return new types.Name(this.operand);
    }
    
    async evaluate (context) {
        const name = this.operand;
        const value = context[name];
        if (value !== undefined && value !== Object.prototype[name]) {
            return types.wrap(value);
        } else {
            return this.undefined(name);
        }
    }
}

class LabellingOperation extends BinaryOperation {
    
    async evaluate (context) {
        
        const term1 = this.operand1.evaluateInNameDomain();
        const term2 = await this.operand2.evaluate(context);
        
        if (term1 instanceof types.Undefined) {
            return this.undefined(term1, term2);
        }

        const names = Array.from(term1).map(types.unwrap);
        const values = Array.from(term2).map(types.unwrap);

        assign(context, names, values);
        
        return term2;
    }
}

class AssignmentOperation extends LabellingOperation {
    
    async evaluate (context) {
        const term2 = await super.evaluate(context);
        if (term2 instanceof types.Undefined && term2.position === this.position) {
            return term2;
        } else {
            return new types.Tuple();
        }
    }
}

class NamespaceDefinition extends UnaryOperation {
    
    async evaluate (context) {
        const subContext = Object.create(context);
        await this.operand.evaluate(subContext);
        return new types.Namespace( Object.assign({}, subContext) );
    }
}

class FunctionDefinition extends BinaryOperation {
    
    async evaluate (context) {
        const params = this.operand1.evaluateInNameDomain();
        if (params instanceof types.Undefined) {
            return this.undefined(params, this.operand2);
        }
        const names = Array.from(params).map(types.unwrap);
        return new types.Func(async (...args) => {
            const functionContext = Object.create(context);
            assign(functionContext, names, args);
            const value = await this.operand2.evaluate(functionContext);
            return types.unwrap(value);
        });
    }
}

class ApplyOperation extends BinaryOperation {
    
    async evaluate (context) {
        const term1 = await this.operand1.evaluate(context);
        const term2 = await this.operand2.evaluate(context);
        
        return term1.imapAsync(async item1 => {
            
            if (item1 instanceof types.Func) {
                const args = Array.from(term2).map(types.unwrap);
                try {
                    return await item1.vmapAsync(f => f(...args));
                } catch (error) {
                    return new types.Undefined(this.position, "Term", error);
                }
            } 
            
            else {
                return this.undefined(term1, term2);
            }
        });
    }
}

class SubcontextingOperation extends BinaryOperation {}

class Exception extends Leaf {
    
    async evaluate (context) {
        return this.undefined(this.value);
    }
}





// -----------------------------------------------------------------------------
//  Unary Operators +x and -x
//  ...
// -----------------------------------------------------------------------------

class PosOperation extends UnaryOperation {}

class NegOperation extends UnaryOperation {}





// -----------------------------------------------------------------------------
//  Logic operations
//  ...
// -----------------------------------------------------------------------------

class OrOperation extends BinaryOperation {}

class AndOperation extends BinaryOperation {}

class ConditionalOperation extends BinaryOperation {}

class AlternativeOperation extends BinaryOperation {}





// -----------------------------------------------------------------------------
//  Arithmetic Binary Operations
//  ...
// -----------------------------------------------------------------------------

class ArithmeticOperation extends BinaryOperation {}

class SumOperation extends ArithmeticOperation {}

class SubOperation extends ArithmeticOperation {}

class MulOperation extends ArithmeticOperation {}

class DivOperation extends ArithmeticOperation {}

class ModOperation extends ArithmeticOperation {}

class PowOperation extends ArithmeticOperation {}





// -----------------------------------------------------------------------------
//  Conditional Binary Operations
//  ...
// -----------------------------------------------------------------------------

class ComparisonOperation extends BinaryOperation {}

class EqOperation extends ComparisonOperation {}

class NeOperation extends ComparisonOperation {}

class LtOperation extends ComparisonOperation {}

class LeOperation extends ComparisonOperation {}

class GtOperation extends ComparisonOperation {}

class GeOperation extends ComparisonOperation {}





// -----------------------------------------------------------------------------
//  Parser
//  ...
// -----------------------------------------------------------------------------

const parser = new Parser({

     binaryOperations: {
         ","  : {precedence:10, wrapper: node => new PairingOperation(node.position, node.children[0], node.children[1])    },
         ":"  : {precedence:12, wrapper: node => new LabellingOperation(node.position, node.children[0], node.children[1])  },
         "="  : {precedence:12, wrapper: node => new AssignmentOperation(node.position, node.children[0], node.children[1]) },
         "->" : {precedence:15, wrapper: node => new FunctionDefinition(node.position, node.children[0], node.children[1]), right:true},

         ";"  : {precedence:21, wrapper: node => new AlternativeOperation(node.position, node.children[0], node.children[1]) },
         "?"  : {precedence:22, wrapper: node => new ConditionalOperation(node.position, node.children[0], node.children[1]) },
         "|"  : {precedence:23, wrapper: node => new OrOperation(node.position, node.children[0], node.children[1])          },
         "&"  : {precedence:23, wrapper: node => new AndOperation(node.position, node.children[0], node.children[1])         },
         
         "==" : {precedence:24, wrapper: node => new EqOperation(node.position, node.children[0], node.children[1]) },
         "!=" : {precedence:24, wrapper: node => new NeOperation(node.position, node.children[0], node.children[1]) },
         "<"  : {precedence:24, wrapper: node => new LtOperation(node.position, node.children[0], node.children[1]) },
         "<=" : {precedence:24, wrapper: node => new LeOperation(node.position, node.children[0], node.children[1]) },
         ">"  : {precedence:24, wrapper: node => new GtOperation(node.position, node.children[0], node.children[1]) },
         ">=" : {precedence:24, wrapper: node => new GeOperation(node.position, node.children[0], node.children[1]) },
         
         "+"  : {precedence:25, wrapper: node => new SumOperation(node.position, node.children[0], node.children[1]) },
         "-"  : {precedence:25, wrapper: node => new SubOperation(node.position, node.children[0], node.children[1]) },
         "*"  : {precedence:26, wrapper: node => new MulOperation(node.position, node.children[0], node.children[1]) },
         "/"  : {precedence:26, wrapper: node => new DivOperation(node.position, node.children[0], node.children[1]) },
         "%"  : {precedence:26, wrapper: node => new ModOperation(node.position, node.children[0], node.children[1]) },
         "^"  : {precedence:27, wrapper: node => new PowOperation(node.position, node.children[0], node.children[1]) },
         
         "."  : {precedence:30, wrapper: node => new SubcontextingOperation(node.position, node.children[0], node.children[1]) },
         ""   : {precedence:30, wrapper: node => new ApplyOperation(node.position, node.children[0], node.children[1])         },
     },
     
     unaryOperations: {
        "+": { wrapper: node => new PosOperation(node.position, null, node.children[0]) },
        "-": { wrapper: node => new NegOperation(node.position, null, node.children[0]) },
     },
     
     groupingOperations: {
         "[]" : { wrapper: node => new ListDefinition(node.position, null, node.children[0])      },
         "{}" : { wrapper: node => new NamespaceDefinition(node.position, null, node.children[0]) },
     },

     literals: {
         void       : { wrapper: node => new VoidLiteral(node.position)},
         identifier : { wrapper: node => new NameReference(node.position, null, node.value)},
         string1    : { wrapper: node => new StringLiteral(node.position, node.value)},
         string2    : { wrapper: node => new StringLiteral(node.position, node.value)},
         string3    : { wrapper: node => new StringTemplate(node.position, node.value)},
         number     : { wrapper: node => new NumberLiteral(node.position, node.value)},
     }
});

const parse = source => {
    const ast = parser.parse(source);
    return async (context={}) => {
        const term = await ast.evaluate(context);
        return term.unwrap();
    }
}


module.exports = {parse}





// -----------------------------------------------------------------------------
//
//  HELPERS
//
// -----------------------------------------------------------------------------

function assign (context, names, values) {
    if (values.length > names.length) {
        values[names.length-1] = new types.Tuple(...values.slice(names.length-1));
    }
    for (var i=0; i<names.length; i++) {
        context[names[i]] = i < values.length ? values[i] : null;
    }
}
