const Lexer = require("./lexer");

const GLOBALS = Symbol("Globals");


function createParser (options) {
    const binaryOperations = options.binaryOperations || {};
    const tokenize = Lexer({binaryOperators: Object.keys(binaryOperations)});
    
    const parse = (source) => {
        
        const parseExpression = (done) => {
            if (done()) {
                i++; return createOperation(options.voidHandler, []);
            }
            
            var expression = [ parseOperand() ];
            
            while (true) {
                if (done()) {
                    i++; break;
                }
                if (tokens[i] && tokens[i].matchBinaryOperator()) {
                    let operator = binaryOperations[ tokens[i].value ]; i++;
                    expression.push(operator);
                    if (done()) throw new Error("Operand expected");
                    let operand = parseOperand();
                    expression.push(operand);
                }
                else {
                    let operator = binaryOperations[""];
                    expression.push(operator);
                    let operand = parseOperand();
                    expression.push(operand);
                }
            }
            
            while (expression.length > 1) {
                
                // find higher precedence operand
                let precedence = 0;
                let operatorIndex = 0;
                for (let j=1; j<expression.length; j+=2) {
                    let operator = expression[j];
                    if (operator.precedence > precedence) {
                        if (operator.right) {
                            let handler = operator.handler;
                            while (expression[j+2] && expression[j+2].handler === handler) j += 2;
                        }
                        precedence = operator.precedence;
                        operatorIndex = j;
                    }
                }
                
                // evaluate the higher precedence operation
                let leftHandOperand = expression[operatorIndex - 1];
                let operator = expression[operatorIndex];
                let rightHandOperand = expression[operatorIndex + 1];
                let operation = createOperation(operator.handler, [leftHandOperand, rightHandOperand]);
                
                // replace the [...,left,operator,right,...] items with the operation node
                expression.splice(operatorIndex-1, 3, operation);
            }
            
            return expression[0];        
        }
        
        const parseOperand = () => {
            var operand;
            
            if (tokens[i] && tokens[i].matchSign() && tokens[i+1].matchNumberLiteral()) {
                let factor = tokens[i].value === "-" ? -1 : 1;
                operand = createOperation(options.numberHandler, [tokens[i+1].value * factor]); i+=2;
            }
            
            else if (tokens[i] && tokens[i].matchNumberLiteral()) {
                operand = createOperation(options.numberHandler, [tokens[i].value]); i++;
            }
            
            else if (tokens[i] && tokens[i].matchStringLiteral()) {
                if (tokens[i].quoteSymbol === "`") operand = createOperation(options.stringHandler0, [tokens[i].value]);
                else if (tokens[i].quoteSymbol === `'`) operand = createOperation(options.stringHandler1, [tokens[i].value]);
                else if (tokens[i].quoteSymbol === `"`) operand = createOperation(options.stringHandler2, [tokens[i].value]);
                i++;
            }
            
            else if (tokens[i] && tokens[i].matchIdentifier()) {
                operand = createOperation(options.nameHandler, [tokens[i].value]); i++;            
            }
            
            else if (tokens[i] && tokens[i].matchSymbol('(')) {
                i++; operand = parseExpression( () => tokens[i] && tokens[i].matchSymbol(")") );
            }
            
            else if (tokens[i] && tokens[i].matchSymbol('[')) {
                i++;
                let expression = parseExpression( () => tokens[i] && tokens[i].matchSymbol("]") );
                operand = createOperation(options.squareGroupHandler, [expression]);
            }
            
            else if (tokens[i] && tokens[i].matchSymbol('{')) {
                i++;
                let expression = parseExpression( () => tokens[i] && tokens[i].matchSymbol("}") );
                operand = createOperation(options.curlyGroupHandler, [expression]);
            }
            
            else {
                throw new Error('Operand expected.');
            }
            
            return operand;
        }
        
        const tokens = tokenize(source);
        var i = 0;
        
        const evaluate = parseExpression( () => i >= tokens.length );

        return evaluate;
    }
    
    return parse;
}


function createOperation (handlerName, operands) {
    return scope => {
        if (typeof scope[handlerName] !== "function") {
            throw new Error(`'${handlerName}' handler not defined in this context`);
        }
        return scope[handlerName](...operands);
    }
}

module.exports = createParser;
