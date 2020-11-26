const Lexer = require("./lexer");

const GLOBALS = Symbol("Globals");


function createParser (options) {
    const binaryOperations = options.binaryOperations || {};
    const tokenize = Lexer({binaryOperators: Object.keys(binaryOperations)});
    
    const parse = (source) => {
        
        const parseExpression = (done) => {
            if (done()) {
                const lastToken = tokens[i] || tokens[tokens.length-1] || {position:0};
                i++; return createOperation(options.voidHandler, [], lastToken.position);
            }
            
            var expression = [ parseOperand() ];
            
            while (true) {
                if (done()) {
                    i++; break;
                }
                if (tokens[i] && tokens[i].matchBinaryOperator()) {
                    let operator = createOperator(tokens[i]); i++;
                    expression.push(operator);
                    if (done()) throw new Error("Operand expected");
                    let operand = parseOperand();
                    expression.push(operand);
                }
                else {
                    let operator = binaryOperations[""];
                    operator.position = tokens[i-1].position;
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
                let operation = createOperation(operator.handler, [leftHandOperand, rightHandOperand], operator.position);
                
                // replace the [...,left,operator,right,...] items with the operation node
                expression.splice(operatorIndex-1, 3, operation);
            }
            
            return expression[0];        
        }
        
        const parseOperand = () => {
            var operand;
            
            if (tokens[i] && tokens[i].matchSign() && tokens[i+1].matchNumberLiteral()) {
                let factor = tokens[i].value === "-" ? -1 : 1;
                operand = createOperation(options.numberHandler, [tokens[i+1].value * factor], tokens[i+1].position); i+=2;
            }
            
            else if (tokens[i] && tokens[i].matchNumberLiteral()) {
                operand = createOperation(options.numberHandler, [tokens[i].value], tokens[i].position); i++;
            }
            
            else if (tokens[i] && tokens[i].matchStringLiteral()) {
                if (tokens[i].quoteSymbol === `'`) operand = createOperation(options.stringHandler1, [tokens[i].value], tokens[i].position);
                else if (tokens[i].quoteSymbol === `"`) operand = createOperation(options.stringHandler2, [tokens[i].value], tokens[i].position);
                i++;
            }
            
            else if (tokens[i] && tokens[i].matchIdentifier()) {
                operand = createOperation(options.nameHandler, [tokens[i].value], tokens[i].position); i++;            
            }
            
            else if (tokens[i] && tokens[i].matchSymbol('(')) {
                i++; operand = parseExpression( () => tokens[i] && tokens[i].matchSymbol(")") );
            }
            
            else if (tokens[i] && tokens[i].matchSymbol('[')) {
                const position = tokens[i].position; i++;
                let expression = parseExpression( () => tokens[i] && tokens[i].matchSymbol("]") );
                operand = createOperation(options.squareGroupHandler, [expression], position);
            }
            
            else if (tokens[i] && tokens[i].matchSymbol('{')) {
                const position = tokens[i].position; i++;
                let expression = parseExpression( () => tokens[i] && tokens[i].matchSymbol("}") );
                operand = createOperation(options.curlyGroupHandler, [expression], position);
            }
            
            else {
                throw new Error('Operand expected.');
            }
            
            return operand;
        }
        
        const createOperator = token => {
            let operator = Object.create(binaryOperations[token.value]);
            operator.position = token.position;
            return operator;
        }
        
        const createOperation = (handlerName, operands, position) => async scope => {
            if (typeof scope[handlerName] !== "function") {
                return createError(scope, new Error(`'${handlerName}' handler not defined in this context`), position);
            }
            try {
                return await scope[handlerName](...operands);            
            } catch (error) {
                return createError(scope, error, position);
            }
        }
        
        const createError = (scope, error, position) => {
            if (!error.location) error.location = {source, position};
            return scope[options.errorHandler](error);            
        }
        
        const tokens = tokenize(source);
        var i = 0;
        
        const evaluate = parseExpression( () => i >= tokens.length );

        return evaluate;
    }
    
    return parse;
}

module.exports = createParser;
