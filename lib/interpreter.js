const {Parser, ASTNode} = require('./parser');
const types = require('./types');

const Undefined = (position, type, ...args) => {
    const undef = new types.Undefined(type, ...args);
    undef.position = position;
    return undef;
}

 
// -----------------------------------------------------------------------------
//  AST Node Wrappers
//  ...
// -----------------------------------------------------------------------------

class BinaryOperation extends ASTNode {
    
    get leftHandOperand () {
        return this.children[0];
    }
    
    get rightHandOperand () {
        return this.children[1];
    }
    
    undefined (leftHandOperand, rightHandOperand) {
        return Undefined(this.position,  this.constructor.name, 
                leftHandOperand, rightHandOperand);
    }
    
    async evaluateInNameDomain (context) {
        const id1 = await this.leftHandOperand.evaluateInNameDomain(context);
        const id2 = await this.rightHandOperand.evaluateInNameDomain(context);
        return this.undefined(id1, id2);
    }
}

class UnaryOperation extends ASTNode {
    
    get operand () {
        return this.children[0];
    }
    
    undefined (operand) {
        return Undefined(this.position, this.constructor.name, operand);
    }
    
    async evaluateInNameDomain (context) {
        const id = await this.operand.evaluateInNameDomain(context);        
        return this.undefined(id);
    }
}

class Leaf extends ASTNode {
    
    undefined (value) {
        return Undefined(this.position, this.constructor.name, value);
    }
    
    async evaluateInNameDomain (context) {
        const value = await this.evaluate(context);
        return this.undefined(value);
    }
    
    async evaluate (context={}) {
        return types.wrap(this.value);
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

class StringTemplate extends UnaryOperation {
    
    async evaluate (context) {
        let text = this.value;
        
        const expressions = [];
        text = text.replace(/\${([\s\S]+?)}/g, (match, expressionSource) => {
            const i = expressions.length;
            expressions.push( parser.parse(expressionSource) );
            return "${" + i + "}";
        });
        
        for (let i=0; i<expressions.length; i++) {
            const xpTerm = await expressions[i].evaluate(context);
            text = text.replace("${" + i + "}", xpTerm.toString());
        }
        
        return new types.Text(text);
    }
}

class PairingOperation extends BinaryOperation {
    
    async evaluateInNameDomain (context) {
        const id1 = await this.leftHandOperand.evaluateInNameDomain(context);
        const id2 = await this.rightHandOperand.evaluateInNameDomain(context);
        if (    (id1 instanceof types.Text || id1 instanceof types.Tuple) && 
                (id2 instanceof types.Text || id2 instanceof types.Tuple)) {
            return new types.Tuple(id1, id2);
        } else {
            return this.undefined(id1, id2);
        }
    }
    
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        return new types.Tuple(term1, term2);
    }
}

class ListDefinition extends UnaryOperation {
    
    async evaluate (context) {
        const term = await this.operand.evaluate(context);
        return types.List.fromTerm(term);
    }    
}

class NameReference extends Leaf {
    
    async evaluateInNameDomain (context) {
        return new types.Text(this.value);
    }
    
    async evaluate (context) {
        const name = this.value;
        return new types.Namespace(context).apply(name);
    }
}

class LabellingOperation extends BinaryOperation {
    
    async evaluate (context) {
        
        const term1 = await this.leftHandOperand.evaluateInNameDomain(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        
        if (term1 instanceof types.Undefined) {
            return this.undefined(term1, term2);
        }

        new types.Namespace(context).assign(term1, term2);
        
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
        const params = await this.leftHandOperand.evaluateInNameDomain(context);
        if (params instanceof types.Undefined) {
            return this.undefined(params, this.rightHandOperand);
        }
        return new types.Func(async (...args) => {
            const functionContext = Object.create(context);
            new types.Namespace(functionContext).assign(params, args);
            const term = await this.rightHandOperand.evaluate(functionContext);
            return types.unwrap(term);
        });
    }
}

class ApplyOperation extends BinaryOperation {
    
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        
        return term1.imapAsync(async item1 => {
            
            if (typeof item1.apply === "function") {
                try {
                    return await item1.apply(...term2);
                } catch (error) {
                    return Undefined(this.position, "Term", error);
                }                
            } 
            
            else {
                return this.undefined(term1, term2);
            }
        });
    }
}

class SubcontextingOperation extends BinaryOperation {
    
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        return await term1.imapAsync(async item1 => {
            if (item1 instanceof types.Namespace) {
                return await item1.vmapAsync(async namespace => {
                    const subContext = Object.create(context);
                    for (let name of item1.domain) subContext[name] = namespace[name];
                    return await this.rightHandOperand.evaluate(subContext);
                })
            } else {
                return this.undefined(item1, this.rightHandOperand);
            }            
        });
    }
}



// -----------------------------------------------------------------------------
//  Unary Operators +x and -x
//  ...
// -----------------------------------------------------------------------------

class IdentityOperation extends UnaryOperation {
    
    async evaluate (context) {
        return this.operand.evaluate(context);
    }
}

class NegationOperation extends UnaryOperation {
    
    async evaluate (context) {
        const term = await this.operand.evaluate(context);
        return term.imapSync(item => {
            if (typeof item.negate === "function") {
                return item.negate();
            } else {
                return this.undefined(item);
            }
        });
    }
}



// -----------------------------------------------------------------------------
//  Logic operations
//  ...
// -----------------------------------------------------------------------------

class OrOperation extends BinaryOperation {
    
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        if (term1.toBoolean()) {
            return term1;
        } else {
            return await this.rightHandOperand.evaluate(context);
        }
    }
}

class AndOperation extends BinaryOperation {
    
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        if (term1.toBoolean()) {
            return await this.rightHandOperand.evaluate(context);
        } else {
            return term1;
        }
    }
}

class ConditionalOperation extends BinaryOperation {
    
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        if (term1.toBoolean()) {
            return await this.rightHandOperand.evaluate(context);
        } else {
            return new types.Tuple();
        }
    }
}

class AlternativeOperation extends BinaryOperation {
    
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        if (term1.isNothing()) {
            return await this.rightHandOperand.evaluate(context);
        } else {
            return term1;
        }
    }    
}



// -----------------------------------------------------------------------------
//  Arithmetic Binary Operations
//  ...
// -----------------------------------------------------------------------------

class ArithmeticOperation extends BinaryOperation {
    
    async evaluate (context, op) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        const pairs = Array.from(term1.iterPairs(term2));
        const items = pairs.map(([item1, item2]) => op(item1, item2));
        return items.length === 1 ? items[0] : new types.Tuple(...items);
    }
}

class SumOperation extends ArithmeticOperation {
    
    async evaluate (context) {
        return await super.evaluate(context, (item1, item2) => {
            if (item1.typeName === item2.typeName && 
                    typeof item1.sum === "function") {
                        
                return item1.sum(item2);
                
            } else {
                return this.undefined(item1, item2);
            }
        });
    }
}

class SubOperation extends ArithmeticOperation {

    async evaluate (context) {
        return await super.evaluate(context, (item1, item2) => {
            if (item1.typeName === item2.typeName && 
                    typeof item1.sum === "function" &&
                    typeof item2.negate === "function") {
                        
                return item1.sum( item2.negate() );
                
            } else {
                return this.undefined(item1, item2);
            }
        });
    }    
}

class MulOperation extends ArithmeticOperation {
    
    async evaluate (context) {
        return await super.evaluate(context, (item1, item2) => {
            if (item1.typeName === item2.typeName && 
                    typeof item1.mul === "function") {
                        
                return item1.mul(item2);
                
            } else {
                return this.undefined(item1, item2);
            }
        });
    }        
}

class DivOperation extends ArithmeticOperation {

    async evaluate (context) {
        return await super.evaluate(context, (item1, item2) => {
            if (item1.typeName === item2.typeName && 
                    typeof item1.mul === "function" &&
                    typeof item2.invert === "function") {
                        
                return item1.mul( item2.invert() );
                
            } else {
                return this.undefined(item1, item2);
            }
        });
    }        
}



// -----------------------------------------------------------------------------
//  Conparison Binary Operations
//  ...
// -----------------------------------------------------------------------------

class ComparisonOperation extends BinaryOperation {
        
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        return term1.compare(term2);
    }
}

class EqOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === '=');
    }
}

class NeOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp !== '=');
    }    
}

class LtOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === '<');
    }        
}

class LeOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === '<' || cmp === '=');
    }        
}

class GtOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === '>');
    }        
}

class GeOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === '>' || cmp === '=');
    }
}



// -----------------------------------------------------------------------------
//  Parser and Interpreter
//  ...
// -----------------------------------------------------------------------------

const parser = new Parser({

     binaryOperations: {
         ","  : {precedence:10, Node: PairingOperation    },
         ":"  : {precedence:12, Node: LabellingOperation  },
         "="  : {precedence:12, Node: AssignmentOperation },
         "->" : {precedence:15, Node: FunctionDefinition, right:true},

         ";"  : {precedence:21, Node: AlternativeOperation },
         "?"  : {precedence:22, Node: ConditionalOperation },
         "|"  : {precedence:23, Node: OrOperation          },
         "&"  : {precedence:23, Node: AndOperation         },
         
         "==" : {precedence:24, Node: EqOperation },
         "!=" : {precedence:24, Node: NeOperation },
         "<"  : {precedence:24, Node: LtOperation },
         "<=" : {precedence:24, Node: LeOperation },
         ">"  : {precedence:24, Node: GtOperation },
         ">=" : {precedence:24, Node: GeOperation },
         
         "+"  : {precedence:25, Node: SumOperation },
         "-"  : {precedence:25, Node: SubOperation },
         "*"  : {precedence:26, Node: MulOperation },
         "/"  : {precedence:26, Node: DivOperation },
         
         "."  : {precedence:30, Node: SubcontextingOperation },
         ""   : {precedence:30, Node: ApplyOperation         },
     },
     
     unaryOperations: {
        "+": { Node: IdentityOperation },
        "-": { Node: NegationOperation },
     },
     
     groupingOperations: {
         "[]" : { Node: ListDefinition      },
         "{}" : { Node: NamespaceDefinition },
     },

     literals: {
         void       : { Node: VoidLiteral    },
         identifier : { Node: NameReference  },
         string1    : { Node: StringLiteral  },
         string2    : { Node: StringLiteral  },
         string3    : { Node: StringTemplate },
         number     : { Node: NumberLiteral  },
     }
});

module.exports = source => {
    const ast = parser.parse(source);        
    return (context={}) => ast.evaluate(context);
}
