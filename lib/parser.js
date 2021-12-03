//  The main export of this module creates and returns a `parse` function,
//  given a set of syntax options.
//  
//  The `parse` function takes an expression string as input and returns an
//  `evaluate` function.
//
//  The `evaluate` function takes an evaluation context as input and returns
//  the expression value as output.handler

const Lexer = require("./lexer");



class Parser {
    
    constructor (options) {
        this.options = options;
        
        // create the lexer, given the list of the valid operators
        this.lexer = new Lexer({
            binaryOperators: Object.keys(options.binaryOperations),
            unaryOperators: Object.keys(options.unaryOperations)
        });
    }
    
    tokenize (source) {
        return new Tokens(...this.lexer.tokenize(source));
    }

    createSyntaxError (message, token) {
        return new Lexer.SyntaxError(message, token.position.source, token.position.index);
    }
    
    createBinaryOperation (operator, leftHandOperand, rightHandOperand, position) {
        const node = new ASTNode(position, 'binary-operation', operator, leftHandOperand, rightHandOperand);
        const wrap = this.options.binaryOperations[operator].wrapper;
        return typeof wrap === 'function' ? wrap(node) : node;
    }
    
    createUnaryOperation (operator, operand, position) {
        const node = new ASTNode(position, 'unary-operation', operator, operand);
        const wrap = this.options.unaryOperations[operator].wrapper;
        return typeof wrap === 'function' ? wrap(node) : node;
    }

    createGroupingOperation (braces, operand, position) {
        const node = new ASTNode(position, 'grouping-operation', braces, operand);
        const wrap = this.options.groupingOperations[braces].wrapper;
        return typeof wrap === 'function' ? wrap(node) : node;
    }

    createLiteral (type, value, position) {
        const node = new ASTNode(position, type, value);
        const wrap = this.options.literals[type].wrapper;
        return typeof wrap === 'function' ? wrap(node) : node;
    }
    
    // The following tuns turns the next tokens into a single Operation tree.
    // It stops when the passed `done` condition is true
    parseExpression (tokens, done) {
        
        // If the `done` condition is immediately true, than the expression
        // is empty and the `void` operation is returned.
        if (done()) {
            const lastToken = tokens.get() || tokens.last || tokens.tail;
            tokens.inc(); return this.createLiteral('void', null, lastToken.position);
        }
        
        // First generates an `expression` list [operand, operator, operand, operator, ...].
        // Then sorts the operators by precedence and returns a function.
        
        // Initialize the shunting-yard object
        const shuntingYard = new ShuntingYard(this.options.binaryOperations);
        shuntingYard.pushOperand( this.parseOperand(tokens) );
        
        // Iterate over all the other operators and operands and add them
        // to the `expression` list until the `done` condition is matched.
        while (!done()) {
            
            // parse nexe operand
            if (tokens.get() && tokens.get().matchBinaryOperator()) {
                shuntingYard.pushOperator(tokens.get().value, tokens.get().position);
                tokens.inc(); 
                if (done()) {
                    throw this.createSyntaxError('Operand expected', tokens.get() || tokens.tail);
                }
            }
            else {
                // if the next token is not an operator, then an empty operator
                // is assumed. This means that the expression consists of 
                // two operands next to each other, without any interposed
                // operator.
                shuntingYard.pushOperator("", tokens.get(-1).position);
            }
            
            // parse nexe operator
            shuntingYard.pushOperand( this.parseOperand(tokens) );
        }
        
        tokens.inc();
        shuntingYard.done();
        
        // Returns the root operation
        return this.popNode(shuntingYard);
    }
    
    popNode (shuntingYard) {
        if (shuntingYard.top instanceof Operator) {
            const operator = shuntingYard.pop();
            const rightHandOperand = this.popNode(shuntingYard);
            const leftHandOperand = this.popNode(shuntingYard);
            return this.createBinaryOperation(operator.symbol, leftHandOperand, rightHandOperand, operator.position);
        } else {
            return shuntingYard.pop();
        }
    }
    
    // Returns the next operand in line.
    // An operand can be a value (leaf) or an branch of the operation tree.
    parseOperand (tokens) {
        var unaryOperator, operand, token = tokens.get();
        
        // If the end of the expression has been reached, throws an error
        if (!token) {
            throw this.createSyntaxError('Operand expected', tokens.tail);
        }
        
        // If the operand is preceded by a unary operator
        if (token.matchUnaryOperator()) {
            unaryOperator = token; 
            token = tokens.inc().get();
        }
        
        // If just a number literal
        if (token.matchNumberLiteral()) {
            operand = this.createLiteral('number', token.value, token.position); 
            tokens.inc();
        }
        
        // If a string literal
        else if (token.matchStringLiteral()) {
            if (token.quoteSymbol === `'`) operand = this.createLiteral('string1', token.value, token.position);
            else if (token.quoteSymbol === `"`) operand = this.createLiteral('string2', token.value, token.position);
            else if (token.quoteSymbol === '`') operand = this.createLiteral('string3', token.value, token.position);
            tokens.inc();
        }
        
        // If an identifier
        else if (token.matchIdentifier()) {
            operand = this.createLiteral('identifier', token.value, token.position);
            tokens.inc();
        }
        
        // If a subexpression between `(` and `)`
        else if (token.matchSymbol('(')) {
            tokens.inc(); 
            operand = this.parseExpression(tokens,  () => tokens.get() && tokens.get().matchSymbol(")") );
        }
        
        // If a subexpression between `[` and `]`
        else if (token.matchSymbol('[')) {
            const position = token.position; 
            tokens.inc();
            let expression = this.parseExpression(tokens,  () => tokens.get() && tokens.get().matchSymbol("]") );
            operand = this.createGroupingOperation('[]', expression, position);
        }
        
        // If a subexpression between `{` and `}`
        else if (token.matchSymbol('{')) {
            const position = token.position; 
            tokens.inc();
            let expression = this.parseExpression(tokens,  () => tokens.get() && tokens.get().matchSymbol("}") );
            operand = this.createGroupingOperation('{}', expression, position);
        }
        
        // No valid operand found
        else {
            throw this.createSyntaxError('Operand expected', token);
        }
        
        if (unaryOperator) {
            return this.createUnaryOperation(unaryOperator.value, operand, unaryOperator.position);
        } else {
            return operand;
        }
    }    
    
    
    parse (source) {
        var tokens = this.tokenize(source);    // array of tokens
        tokens.tail = {position: new Lexer.Position(source, source.length)};
        
        // Parse the entier expression and return the `evaluate` function
        return this.parseExpression(tokens, () => tokens.done() );
    }
    
    static get Position () {
        return Lexer.Position;
    }
}



class Tokens {
    
    constructor (...tokens) {
        this.tokens = tokens;
        this.index = 0;
    }
    
    inc (step=1) {
        this.index += step;
        return this;
    }
    
    get (step=0) {
        return this.tokens[this.index+step];
    }
    
    get last () {
        return this.tokens[this.tokens.length-1];
    }
    
    done () {
        return this.index >= this.tokens.length;
    }
}


class ShuntingYard {
    
    constructor (binaryOperations) {
        this.binaryOperations = binaryOperations;
        this.output = [];       // output queue
        this.operators = [];    // operators stack
    }
    
    pushOperand (operand) {
        this.output.push(operand);
    }
    
    pushOperator (symbol, position) {
        const operator = new Operator(symbol, this.binaryOperations[symbol], position);
        while (this.operators.length > 0 && this.lastOperator.preceeds(operator)) {
            this.output.push(this.operators.pop());
        }
        this.operators.push(operator);
    }
    
    done () {
        while (this.operators.length > 0) {
            this.output.push(this.operators.pop());            
        }
    }
    
    get lastOperator () {
        return this.operators[this.operators.length-1] || null;
    }
    
    get top () {
        return this.output[this.output.length-1];
    }
    
    pop () {
        return this.output.pop();
    }
}

class Operator {
    
    constructor (symbol, options, position) {
        this.symbol = symbol;
        this.options = options;
        this.position = position;
    }
    
    get precedence () { return this.options.precedence }
    
    get isRightAssociative () { return Boolean(this.options.right) }
    
    get isLeftAssociative () { return !this.isRightAssociative }
    
    preceeds (other) {
        return this.precedence > other.precedence ||
                (this.precedence === other.precedence && other.isLeftAssociative);
    }
}


class ASTNode {
    
    constructor (pos, type, value, ...children) {
        this.position = pos;
        this.type = type;
        this.value = value;
        this.children = children;
    }
}




module.exports = {Parser, ASTNode};
