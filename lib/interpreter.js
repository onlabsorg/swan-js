const {Parser, ASTNode} = require('./parser');
const types = require('./types');

 
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
        return new types.Undefined(this.position,  this.constructor.name, 
                null, leftHandOperand, rightHandOperand);
    }
    
    async evaluateInNameDomain (context) {
        const id1 = await this.leftHandOperand.evaluateInNameDomain(context);
        const id2 = await this.rightHandOperand.evaluateInNameDomain(context);
        return this.undefined(id1, id2);
    }
    
    static *iterPairs (term1, term2) {
        const iterator1 = term1[Symbol.iterator]();
        const iterator2 = term2[Symbol.iterator]();
        while (true) {
            let iterItem1 = iterator1.next();
            let iterItem2 = iterator2.next();
            if (iterItem1.done && iterItem2.done) break;
            yield [types.wrap(iterItem1.value), types.wrap(iterItem2.value)];
        }                        
    }
}

class UnaryOperation extends ASTNode {
    
    get operand () {
        return this.children[0];
    }
    
    undefined (operand) {
        return new types.Undefined(this.position, this.constructor.name, 
                null, operand);
    }
    
    async evaluateInNameDomain (context) {
        const id = await this.operand.evaluateInNameDomain(context);        
        return this.undefined(id);
    }
}

class Leaf extends ASTNode {
    
    undefined (value) {
        return new types.Undefined(this.position, this.constructor.name, value);
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
        if (    (id1 instanceof types.Name || id1 instanceof types.Tuple) && 
                (id2 instanceof types.Name || id2 instanceof types.Tuple)) {
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
        return new types.Name(this.value);
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

        this.constructor.assign(context, term1, term2);
        
        return term2;
    }
    
    static assign (context, term1, term2) {
        const names = Array.from(term1).map(types.unwrap);
        const values = Array.from(term2).map(types.unwrap);
        if (values.length > names.length) {
            values[names.length-1] = new types.Tuple(...values.slice(names.length-1));
        }
        for (var i=0; i<names.length; i++) {
            context[names[i]] = i < values.length ? types.unwrap(values[i]) : null;
        }
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
            LabellingOperation.assign(functionContext, params, args);
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
                    return new types.Undefined(this.position, "Term", error);
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
            if (item instanceof types.Numb) {
                return item.vmapSync(value => -value);
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
        if (!term1.toBoolean()) {
            return term1;
        } else {
            return await this.rightHandOperand.evaluate(context);
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
        if (!term1.isNothing()) {
            return term1;
        } else {
            return await this.rightHandOperand.evaluate(context);
        }
    }    
}



// -----------------------------------------------------------------------------
//  Arithmetic Binary Operations
//  ...
// -----------------------------------------------------------------------------

class ArithmeticOperation extends BinaryOperation {
    
    async evaluate (context, handlers) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        const pairs = Array.from(this.constructor.iterPairs(term1, term2));
        
        const values = pairs.map(
            ([item1, item2]) => {
                const value1 = types.unwrap(item1),
                      type1 = value1 === null ? "Nothing" : item1.typeName;
                const value2 = types.unwrap(item2),
                      type2 = value2 === null ? "Nothing" : item2.typeName;
                const handler = handlers[`${type1},${type2}`] || 
                                handlers[`${type1},Anything`] || 
                                handlers[`Anything,${type2}`] || 
                                handlers.default;
                return handler(value1, value2, item1, item2);
            }
        );
        
        return new types.Tuple(...values);
    }
}

class SumOperation extends ArithmeticOperation {
    
    async evaluate (context) {
        return await super.evaluate(context, {
            "Nothing,Anything"    : (value1, value2) => value2,
            "Anything,Nothing"    : (value1, value2) => value1,
            "Bool,Bool"           : (value1, value2) => value1 || value2,
            "Numb,Numb"           : (value1, value2) => value1 + value2,
            "Text,Text"           : (value1, value2) => value1 + value2,
            "List,List"           : (value1, value2) => value1.concat(value2),
            "Namespace,Namespace" : (value1, value2) => Object.assign({}, value1, value2),
            "default"             : (value1, value2) => this.undefined(value1, value2)
        });
    }
}

class SubOperation extends ArithmeticOperation {

    async evaluate (context) {
        return await super.evaluate(context, {
            "Anything,Nothing"    : (value1, value2) => value1,
            "Numb,Numb"           : (value1, value2) => value1 - value2,
            "default"             : (value1, value2) => this.undefined(value1, value2)
        });
    }    
}

class MulOperation extends ArithmeticOperation {
    
    async evaluate (context) {
        return await super.evaluate(context, {
            "Nothing,Anything"    : (value1, value2) => null,
            "Anything,Nothing"    : (value1, value2) => null,
            "Bool,Anything"       : (value1, value2, item1, item2) => value1 ? value2 : item2.toVoid(),
            "Anything,Bool"       : (value1, value2, item1, item2) => value2 ? value1 : item1.toVoid(),
            "Numb,Numb"           : (value1, value2) => value1 * value2,
            "default"             : (value1, value2) => this.undefined(value1, value2)
        });
    }        
}

class DivOperation extends ArithmeticOperation {

    async evaluate (context) {
        return await super.evaluate(context, {
            "Nothing,Anything"    : (value1, value2) => null,
            "Numb,Numb"           : (value1, value2) => value1 / value2,
            "default"             : (value1, value2) => this.undefined(value1, value2)
        });
    }        
}

class ModOperation extends ArithmeticOperation {
    
    async evaluate (context) {
        return await super.evaluate(context, {
            "Nothing,Anything"    : (value1, value2) => value2,
            "Numb,Numb"           : (value1, value2) => value1 % value2,
            "default"             : (value1, value2) => this.undefined(value1, value2)
        });
    }        
}

class PowOperation extends ArithmeticOperation {
    
    async evaluate (context) {
        return await super.evaluate(context, {
            "Nothing,Anything"    : (value1, value2) => null,
            "Numb,Numb"           : (value1, value2) => value1 ** value2,
            "default"             : (value1, value2) => this.undefined(value1, value2)
        });
    }        
}



// -----------------------------------------------------------------------------
//  Conparison Binary Operations
//  ...
// -----------------------------------------------------------------------------

const EQ = new types.Text("equal");
const GT = new types.Text("greater-than");
const LT = new types.Text("less-than");
const NE = new types.Text("not-equal");

class ComparisonOperation extends BinaryOperation {
        
    async evaluate (context) {
        const term1 = await this.leftHandOperand.evaluate(context);
        const term2 = await this.rightHandOperand.evaluate(context);
        return this._compareTerms(term1, term2);
    }
    
    _compareTerms (term1, term2) {
        for (let [item1, item2] of this.constructor.iterPairs(term1, term2)) {
            let cmp = this._compareItems(item1, item2);
            if (cmp !== EQ) return cmp;
        }
        return EQ;
    }
    
    _compareItems (item1, item2) {
        const value1 = types.unwrap(item1);
        const value2 = types.unwrap(item2);

        if (value1 === value2) return EQ;        
        
        // NOTHING is equal to itself and less than anything else
        if (value1 === null) return LT;
        if (value2 === null) return GT;
        
        switch (`${item1.typeName},${item2.typeName}`) {
            
            case "Bool,Bool": 
                // FALSE == FALSE < TRUE == TRUE
                return value1 === value2 ? EQ : (value1 ? GT : LT);         
                
            case "Numb,Numb": 
                // As per JavaScript number comparison
                return value1 === value2 ? EQ : (value1<value2 ? LT : GT);   
                
            case "Text,Text": 
                // Alphabetical comparison
                const strCmp = value1.localeCompare(value2)
                return strCmp === 0 ? EQ : (strCmp < 0 ? LT : GT);
                
            case "List,List":
                // Lexicographical comparison
                return this._lexCompareLists(value1, value2);
                
            case "Namespace,Namespace":
                // Deep equality check. No order defined.
                return this._compareNamespaces(item1, item2);
            
            default:
                // Not equal.
                return NE;
        }    
    }
    
    // Runs a lexicographycal comparison of the two lists and returns 
    //  -1 if tuple1 < tuple2; 
    //  +1 if tuple1 > tuple2; 
    //  0 if tuple1 == tuple2.
    _lexCompareLists (list1, list2) {
        const maxLength = Math.max(list1.length, list2.length);
        for (let i=0; i<maxLength; i++) {
            const item1 = types.wrap(list1[i]);
            const item2 = types.wrap(list2[i]);
            const cmp = this._compareItems(item1, item2);
            if (cmp !== EQ) return cmp;
        }
        return EQ;
    }
    
    _compareNamespaces (namespace1, namespace2) {
        const nameList1 = Array.from(namespace1.enumerate());   // only valid names
        const nameList2 = Array.from(namespace2.enumerate());   // only valid names
        if (nameList1.length !== nameList2.length) return NE;
        for (let name of nameList1) {
            const term1 = namespace1.apply(name);
            const term2 = namespace2.apply(name);
            if (this._compareTerms(term1, term2) !== EQ) return NE;
        }
        return EQ;
    }
}

class EqOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === EQ);
    }
}

class NeOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp !== EQ);
    }    
}

class LtOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === LT);
    }        
}

class LeOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === LT || cmp === EQ);
    }        
}

class GtOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === GT);
    }        
}

class GeOperation extends ComparisonOperation {
    
    async evaluate (context) {
        const cmp = await super.evaluate(context);
        return new types.Bool(cmp === GT || cmp === EQ);
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
         "%"  : {precedence:26, Node: ModOperation },
         "^"  : {precedence:27, Node: PowOperation },
         
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
    try {
        
        const ast = parser.parse(source);        
        return async (context={}) => {
            const term = await ast.evaluate(context);
            return types.unwrap(term);            
        }
        
    } catch (error) {
        
        const position = error.position instanceof Parser.Position ?
                error.position :
                new Parser.Position(source, source.length);
        const retval = new types.Undefined(position, "Syntax", error);
        return () => retval;
    }
}
