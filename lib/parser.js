// This is the parser used by the Swan interpreter. In general the module
// provides a parser able to generate an abstract syntax tree from any
// sequence of binary or unary operations evantually grouped with parenthesis,
// square braces or curly braces.



// The Lexer converts a plain expression string in a sequence of tokens.
// This is the first step of the parsing procedure.
const Lexer = require("./lexer");



//  The `Parser` class that takes as parametse an `options` object that defines 
//  the expression operations.
//  
//  A `Parser` instance has a `parse` method that takes an expression string as
//  argument and return an Abstract Syntax Tree. Each node of the AST is an
//  instance of the ASTNode class, which is also exported by this module.
class Parser {
    
    constructor (options) {
        this.options = options;
        
        // create the lexer, given the list of the valid operators
        this.lexer = new Lexer({
            binaryOperators: Object.keys(options.binaryOperations),
            unaryOperators: Object.keys(options.unaryOperations)
        });
    }
    
    // Converts an expression string to a list of tokens and return a `Tokens`
    // instance (See Token class below).
    tokenize (source) {
        return new Tokens(...this.lexer.tokenize(source));
    }

    // Creates a Syntax error
    createSyntaxError (message, token) {
        return new Lexer.SyntaxError(message, token.position.source, token.position.index);
    }
    
    // Creates a binary operation ASTNode. It eventually uses a custom ASTNode 
    // class if provided with the options object.
    createBinaryOperation (operator, leftHandOperand, rightHandOperand, position) {
        const Node = this.options.binaryOperations[operator].Node || ASTNode;
        return new Node(position, 'binary-operation', operator, leftHandOperand, rightHandOperand);
    }
    
    // Creates a unary operation ASTNode. It eventually uses a custom ASTNode 
    // class if provided with the options object.
    createUnaryOperation (operator, operand, position) {
        const Node = this.options.unaryOperations[operator].Node || ASTNode;
        return new Node(position, 'unary-operation', operator, operand);
    }

    // Creates a grouping operation ASTNode. It eventually uses a custom ASTNode 
    // class if provided with the options object.
    createGroupingOperation (braces, operand, position) {
        const Node = this.options.groupingOperations[braces].Node || ASTNode;
        return new Node(position, 'grouping-operation', braces, operand);
    }

    // Creates a literal ASTNode. It eventually uses a custom ASTNode class
    // if provided with the options object.
    createLiteral (type, value, position) {
        const Node = this.options.literals[type].Node || ASTNode;
        return new Node(position, type, value);
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
    
    // Extracts an abstract syntax tree from the ShuntingYard object.
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
    
    // This is the main API of this class. The user calls it to obtain an
    // abstract syntax tree from the passed expression source.
    parse (source) {
        var tokens = this.tokenize(source);    // array of tokens
        tokens.tail = {position: new Lexer.Position(source, source.length)};
        
        // Parse the entier expression and return the `evaluate` function
        return this.parseExpression(tokens, () => tokens.done() );
    }
    
    // Expose the Position object to the final user of this class.
    static get Position () {
        return Lexer.Position;
    }
}



// A Tokens object contains the string of tokens returned by the lexer, together
// with a bunch of handy methods designed to help the parsing process.
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



// The ShuntingYard instances implement the shunting yard algorithm to sort the
// binary AST nodes based on the operator precedences. The precedences are
// defined in the `binaryOperations` object passed to the constructor.
// The `binaryOperations` object is defined by the user and passed to the
// `Parser` constructor under `options.binaryOperations`.
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



// This class represents an operator being processed by the shunting yard
// algorithm. This object is used by the `ShuntngYard` objects and by the
// `popNode` method of the `Parser` objects.
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



// This is a node of the Abstrac Syntax Tree returned by `parser.parse(expression)`.
class ASTNode {
    
    constructor (pos, type, value, ...children) {
        
        // Position object containing informations about the location of this
        // nome in the expression source. See `Position` class definition in
        // lexer module.
        this.position = pos;
        
        // node.type contains one of the following strings:
        //
        //  - `"binary-operation"` if the node represents a binary operation. 
        //      In that case `node.value` contains the operator symbol and 
        //      `node.children` contains the left-hand and right-hand operands
        //      (which are in turns ASTNode instances).
        //      
        //  - `"unary-operation"` if the node represents a unary operation. 
        //      In that case `node.value` contains the operator symbol and 
        //      `node.children` contains the operand (which is in turns an 
        //      ASTNode instance).
        //      
        //  - `"grouping-operation"` if the node represents a grouping between
        //      squanre or curly braces. In that case `node.value` contains 
        //      either `"[]"` or `"{}"` and `node.children` contains the node
        //      representing the expression between braces.
        //      
        //  - `"void"` if the node represents a void literal `()`. In that case
        //      `node.value` is null and `node.children` is an empty array.
        //
        //  - `"number"` if the node represents a number literal. In that case
        //      `node.value` contains the numeric value and `node.children` is 
        //      an empty array.
        //
        //  - `"string1"` if the node represents a string literal enclosed 
        //      between single quotes `''`. In that case `node.value` contains 
        //      the text value and `node.children` is an empty array.
        //
        //  - `"string2"` if the node represents a string literal enclosed 
        //      between double quotes `""`. In that case `node.value` contains 
        //      the text value and `node.children` is an empty array.
        //
        //  - `"string3"` if the node represents a string literal enclosed 
        //      between accent quotes ````. In that case `node.value` contains 
        //      the text value and `node.children` is an empty array.
        //
        //  - `"identifier"` if the node represents an identifier. In that case 
        //      `node.value` contains the identifier as string and  
        //      `node.children` is an empty array.
        this.type = type;
        this.value = value;
        this.children = children;
    }
}



// Exports
module.exports = {Parser, ASTNode};
