// =============================================================================
//  INTERPRETER
//
//  This module exports a `parser` function that takes an expression string as
//  input and returns an asynchronous `evaluate` function. The `evaluate`
//  function takes a context object, evaluate the expression AST and returns
//  the expression value.
//  
//  The parser function is a `Parser` instance (see parser module). The parser
//  is configured to wrap the AST nodes in custom nodes. Each custom node
//  has an `evaluate` function that takes a `context` as input and returns
//  the node value.
//
//  The node values returned by the `parse` function are wrapped in a type
//  object (see types module).
//  
// =============================================================================

const {matchIdentifier} = require("./lexer");
const {Parser, ASTNode} = require('./parser');

const types = require('./types');
const Undefined = (position, type, ...args) => {
    const undef = new types.Undefined(type, ...args);
    undef.position = position;
    return undef;
}


 
// -----------------------------------------------------------------------------
//  AST Node Wrappers
//
//  These are the basic type of AST nodes: each node is either a binary
//  operation, a unary operatio or a leaf.
// -----------------------------------------------------------------------------

// Generic binary operation used as a base class for actual AST nodes.
class BinaryOperation extends ASTNode {
    
    // left-hand node of this binary operation
    get leftHandOperand () {
        return this.children[0];
    }
    
    // right-hand node of this binary operation
    get rightHandOperand () {
        return this.children[1];
    }
    
    // shortcut function to create a `types.Undefined` value when the binary
    // operation is not defined
    undefined (leftHandOperand, rightHandOperand) {
        return Undefined(this.position,  this.constructor.name, 
                leftHandOperand, rightHandOperand);
    }
    
    // this is inernally used to evaluate name definitions, when identifiers
    // should not be resolved to their mapped values.
    async evaluateInNameDomain (context) {
        const id1 = await this.leftHandOperand.evaluateInNameDomain(context);
        const id2 = await this.rightHandOperand.evaluateInNameDomain(context);
        return this.undefined(id1, id2);
    }
}

// Generic unary operation used as a base class for actual AST nodes.
class UnaryOperation extends ASTNode {

    // the operand node of this unary operation
    get operand () {
        return this.children[0];
    }
    
    // shortcut function to create a `types.Undefined` value when the unary
    // operation is not defined
    undefined (operand) {
        return Undefined(this.position, this.constructor.name, operand);
    }
    
    // this is inernally used to evaluate name definitions, when identifiers
    // should not be resolved to their mapped values.
    async evaluateInNameDomain (context) {
        const id = await this.operand.evaluateInNameDomain(context);        
        return this.undefined(id);
    }
}

// Generic leaf used as a base class for actual AST terminal nodes.
class Leaf extends ASTNode {
    
    // shortcut function to create a `types.Undefined` value when the leaf
    // value is not defined
    undefined (value) {
        return Undefined(this.position, this.constructor.name, value);
    }
    
    // this is inernally used to evaluate name definitions, when identifiers
    // should not be resolved to their mapped values.
    async evaluateInNameDomain (context) {
        const value = await this.evaluate(context);
        return this.undefined(value);
    }
    
    // by default, a leaf node evaluates to the node value
    async evaluate (context={}) {
        return types.wrap(this.value);
    }
}



// -----------------------------------------------------------------------------
//  Core Operations
// 
//  These are the foundamental operations of the swan language.
// -----------------------------------------------------------------------------

// Node representing a `()` literal, which is an empty tuple (aka Nothing).
class VoidLiteral extends Leaf {
    
    async evaluate (context) {
        return new types.Tuple();
    }
}

// Node representing a numeric literal, such as `123.45`.
class NumberLiteral extends Leaf {
    
    async evaluate (context={}) {
        return new types.Numb(this.value);
    }
}

// Node representing a string literal, such as `"abc"` or `'abc'`.
class StringLiteral extends Leaf {
    
    async evaluate (context={}) {
        return new types.Text(this.value);
    }
}

// Node representing a string template, which is a text enclosed between
// accent quotes "`" and containing inline swan expression enclosed between
// `${` and `}`.
class StringTemplate extends UnaryOperation {
    
    async evaluate (context) {
        
        // retrieve the raw template text
        let text = this.value;
        
        // replace all the inline expressions with a placeholder
        const expressions = [];
        text = text.replace(/\${([\s\S]+?)}/g, (match, expressionSource) => {
            const i = expressions.length;
            expressions.push( parser.parse(expressionSource) );
            return "${" + i + "}";
        });
        
        // evaluate the inline expression and push their serialized value back
        // to the template text
        for (let i=0; i<expressions.length; i++) {
            const xpTerm = await expressions[i].evaluate(context);
            text = text.replace("${" + i + "}", xpTerm.toString());
        }
        
        // wrap and return the resolved template text
        return new types.Text(text);
    }
}

// Node representing a pairing operation `X , Y` which defines a tuple.
class PairingOperation extends BinaryOperation {
    
    // Pairs the names on the left-hand side of an assignment operation such
    // as `a,b = 1,2` or of a function definition such as `(a,b) -> a+b`.
    async evaluateInNameDomain (context) {
        const id1 = await this.leftHandOperand.evaluateInNameDomain(context);
        const id2 = await this.rightHandOperand.evaluateInNameDomain(context);
        if ((id1 instanceof types.Text || id1 instanceof types.Tuple) && 
            (id2 instanceof types.Text || id2 instanceof types.Tuple)) {
            return new types.Tuple(id1, id2);
        } else {
            return this.undefined(id1, id2);
        }
    }
    
    // Create a tuple given two terms.
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        return new types.Tuple(term1, term2);
    }
}

// Node representing a list literal `[T]`, where `T` is a tuple.
class ListDefinition extends UnaryOperation {
    
    // Turns the child node into a list object
    async evaluate (context) {
        const term = await this.operand.evaluate(context);
        return new types.List( Array.from(term) );
    }    
}

// Node representing an identifier, which will be evaluated to its mapped value.
class NameReference extends Leaf {
    
    // Returns the identifier value as a Text object
    async evaluateInNameDomain (context) {
        return new types.Text(this.value);
    }
    
    // Returns the name mapped to the identifier value in the given context
    async evaluate (context) {
        const name = this.value;
        if (!matchIdentifier(name)) return this.undefined(name);
        const value = context[name];
        if (value === Object.prototype[name]) return this.undefined(name);
        return types.wrap(value);
    }
}

// Node representing a labelling operation `name : value`.
class LabellingOperation extends BinaryOperation {
    
    // Maps the left-hand names to the right-hand values and returns the values
    async evaluate (context) {
        
        const term1 = await this.leftHandOperand.evaluateInNameDomain(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        
        if (term1 instanceof types.Undefined) {
            return this.undefined(term1, term2);
        }

        this.constructor.defineNames(context, term1, term2);
        //new types.Namespace(context).assign(term1, term2);
        
        return term2;
    }
    
    static defineNames (context, term1, term2) {
        const names = Array.from(term1).map(types.unwrap);
        const values = Array.from(term2).map(types.unwrap);
        
        if (values.length > names.length) {
            values[names.length-1] = new types.Tuple(...values.slice(names.length-1));
        }
        
        for (let i=0; i<names.length; i++) {
            context[ names[i] ] = i < values.length ? types.unwrap(values[i]) : null;
        }        
    }
}

// Node representing an assignment operation `name = value`.
class AssignmentOperation extends LabellingOperation {
    
    // Maps the left-hand names to the right-hand values and returns Nothing
    async evaluate (context) {
        const term2 = await super.evaluate(context);
        if (term2 instanceof types.Undefined && term2.position === this.position) {
            return term2;
        } else {
            return new types.Tuple();
        }
    }
}

// Node representing a namespace literal `{T}`, where `T` is a tuple.
class NamespaceDefinition extends UnaryOperation {
    
    // Evaluates the operand in a child context and returns the resulting namespace
    async evaluate (context) {
        const subContext = Object.assign(Object.create(context), {});
        await this.operand.evaluate(subContext);
        return new types.Namespace( Object.assign({}, subContext) );
    }
}

// Node representing a function definition `names -> expression`.
class FunctionDefinition extends BinaryOperation {
    
    // Creates a new Func object
    async evaluate (context) {
        const params = await this.leftHandOperand.evaluateInNameDomain(context);
        if (params instanceof types.Undefined) {
            return this.undefined(params, this.rightHandOperand);
        }
        const func = async (...args) => {
            const functionContext = Object.create(context);
            functionContext.self = func;
            LabellingOperation.defineNames(functionContext, params, args);
            return await this.rightHandOperand.evaluate(functionContext);
        }
        return new types.Func(func);
    }
}

// Node representing an application operation `Y X`.
class ApplyOperation extends BinaryOperation {
    
    // Returns LHO(RHO), where LHO can be a Func or a Mapping
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        return await this.apply(term1, term2);
    }
    
    apply (term1, term2) {
        return term1.imapAsync(async item1 => {
            
            if (item1 instanceof types.Applicable) {
                try {
                    return types.wrap( await item1.apply(...term2) );
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

// Node representing a map operation `X => Y`.
class MapOperation extends ApplyOperation {
    
    // (a,b,c) => F returns (F a, F b, F c)
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);        
        return term1.imapAsync(item1 => this.apply(term2, item1));
    }
}

// Node representing a function piping operation `X >> Y`.
class PipeOperation extends ApplyOperation {
    
    // (f >> g) x returns g(f x) 
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        return new types.Func(async (...args) => {
            const args1 = new types.Tuple(...args);
            const args2 = await this.apply(term1, args1);
            return await this.apply(term2, args2);
        });
    }
}

// Node representing a function composition operation `X << Y`.
class ComposeOperation extends ApplyOperation {
    
    // (f << g) x returns f(g x) 
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        return new types.Func(async (...args) => {
            const args2 = new types.Tuple(...args);
            const args1 = await this.apply(term2, args2);
            return await this.apply(term1, args1);
        });
    }
}

// Node representing a sub-contexting operation `X . Y`.
class SubcontextingOperation extends BinaryOperation {
    
    // Evaluates the RHO in a new child-context augumented with the LHO
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        return await term1.imapAsync(async item1 => {
            if (item1 instanceof types.Namespace) {
                return await item1.vmapAsync(async namespace => {
                    const subContext = Object.assign(Object.create(context), namespace);
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
//  
//  There are only two unary operations is swan: `+X` and `-X`.
// -----------------------------------------------------------------------------

// Node representing a `+X` unary operation.
class IdentityOperation extends UnaryOperation {
    
    async evaluate (context) {
        return this.operand.evaluate(context);
    }
}

// Node representing a `-X` unary operation.
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
//  
//  Nodes representing the swan logic operations `AND`, `OR`, `IF` and `ELSE`.
// -----------------------------------------------------------------------------

// Node representing the OR operation `X | Y`.
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

// Node representing the AND operation `X & Y`.
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

// Node representing the IF operation `X ? Y`.
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

// Node representing the ELSE operation `X ; Y`.
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
//  
//  These nodes represnt the swan binary operations `+`, `-`, `*`, `/` and `**`.
// -----------------------------------------------------------------------------

// Generic arithmetic operation used as base for the actual operations.
class ArithmeticOperation extends BinaryOperation {
    
    async evaluate (context, op) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        const pairs = Array.from(term1.iterPairs(term2));
        const items = pairs.map(([item1, item2]) => op(item1, item2));
        return items.length === 1 ? items[0] : new types.Tuple(...items);
    }
}

// Node representing a sum operation `X + Y`.
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

// Node representing a subtraction operation `X - Y`.
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

// Node representing a product operation `X * Y`.
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

// Node representing a division operation `X / Y`.
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

// Node representing a modulo operation `X % Y`.
class ModOperation extends ArithmeticOperation {

    async evaluate (context) {
        return await super.evaluate(context, (item1, item2) => {
            if (item1 instanceof types.Numb && item2 instanceof types.Numb) {
                return types.wrap( types.unwrap(item1) % types.unwrap(item2) );
                
            } else {
                return this.undefined(item1, item2);
            }
        });
    }        
}

// Node representing a power operation `X ** Y`.
class PowOperation extends ArithmeticOperation {

    async evaluate (context) {
        return await super.evaluate(context, (item1, item2) => {
            if (item1.typeName === item2.typeName && 
                    typeof item1.pow === "function") {
                        
                return item1.pow(item2);
                
            } else {
                return this.undefined(item1, item2);
            }
        });
    }        
}



// -----------------------------------------------------------------------------
//  Comparison Binary Operations
//  
//  Nodes representing the comparison operations `==`, `!=`, `>`, `>=`, `<` and
//  `<=`.
// -----------------------------------------------------------------------------

// Generic comparison operation used as base for the actual operations.
class ComparisonOperation extends BinaryOperation {
        
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        return term1.compare(term2);
    }
}

// Node representing an equality check operation `X == Y`.
class EqOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === '=');
    }
}

// Node representing an non-equality check operation `X != Y`.
class NeOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp !== '=');
    }    
}

// Node representing a less-than check operation `X < Y`.
class LtOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === '<');
    }        
}

// Node representing a less-than-or-equal-to check operation `X <= Y`.
class LeOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === '<' || cmp === '=');
    }        
}

// Node representing a greater-than check operation `X > Y`.
class GtOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === '>');
    }        
}

// Node representing a greater-than-or-equal-to check operation `X >= Y`.
class GeOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === '>' || cmp === '=');
    }
}



// -----------------------------------------------------------------------------
//  Parser  
// -----------------------------------------------------------------------------

const parser = new Parser({

     binaryOperations: {
         ","  : {precedence:10, Node: PairingOperation    },
         ":"  : {precedence:12, Node: LabellingOperation  },
         "="  : {precedence:12, Node: AssignmentOperation },
         "=>" : {precedence:13, Node: MapOperation        },
         ">>" : {precedence:14, Node: PipeOperation       },
         "<<" : {precedence:14, Node: ComposeOperation  , right:true},
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
         "%"  : {precedence:26, Node: ModOperation },
         "**" : {precedence:27, Node: PowOperation },
         
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

