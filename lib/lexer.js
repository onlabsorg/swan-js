

function createLexer (options) {
    const matchSpace = char => char && char.match(/^\s$/);
    const matchQuote = char => char && char.match(/^["'`]$/);
    const matchIdentifierStart = char => char && char.match(/^[a-z_A-Z]$/);
    const matchIdentifierPart = char => char && char.match(/^[a-z_A-Z0-9]$/);
    const matchDecimalDigit = char => char && char.match(/^[0-9]$/);
    const matchSign = char => char === "+" || char === "-";
    const matchCommentStart = sym => sym === "#";

    const binaryOperators = new Set(options.binaryOperators);
    
    const SYMBOLS = new Set( ['{', '[', '(', ')', ']', '}'].concat(options.binaryOperators.filter(operator => !matchIdentifierStart(operator))) );
    const matchSymbol = sym => SYMBOLS.has(sym);
    
    class Token {
        
        constructor (type, value, pos) {
            this.type = type;
            this.value = value;
            this.position = pos;
        }    
        
        matchSymbol (sym) {
            return this.type === Token.SYMBOL && this.value === sym;
        }
        
        matchSign () {
            return this.matchSymbol("+") || this.matchSymbol("-");
        }
        
        matchIdentifier () {
            return this.type === Token.IDENTIFIER && !binaryOperators.has(this.value);
        }
        
        matchBinaryOperator () {
            return (this.type === Token.SYMBOL || this.type === Token.IDENTIFIER) && 
                    binaryOperators.has(this.value);
        }
        
        matchOpenBracket () {
            return this.matchSymbol('(') || this.matchSymbol('[');
        }
        
        matchNumberLiteral () {
            return this.type === Token.NUMBER;
        }
        
        matchStringLiteral () {
            return this.type === Token.STRING;
        }

        matchLiteral () {
            return this.type === Token.NUMBER || this.type === Token.STRING;
        }
    }

    // Token types
    Token.SYMBOL = 0;
    Token.NUMBER = 1;
    Token.STRING = 2;
    Token.IDENTIFIER = 3;
    Token.MISSING = 4;
    
    
    const tokenize = (source) => {
        const tokens = [];
        const createToken = (type, value, index) => new Token(type, value, new Position(source, index));
        const createSyntaxError = (message, index) => new SyntaxError(message, source, index);
        
        var i = 0, len = source.length;
        while (true) {
            while (matchSpace(source[i])) i++;
            if (i >= len) break;

            // if string literal
            if (matchQuote(source[i])) {
                let value = "";            
                let quoteSymbol = source[i]; i++;
                while (source[i] !== quoteSymbol) {
                    if (i >= len) throw createSyntaxError("Closing quote expected", i);
                    value += source[i]; i++;
                }
                let token = createToken(Token.STRING, value, i);
                token.quoteSymbol = quoteSymbol;
                tokens.push(token); i++;
            }
            
            // if identifier
            else if (matchIdentifierStart(source[i])) {
                let value = source[i]; i++;
                while (matchIdentifierPart(source[i])) {
                    value += source[i]; i++;
                }
                tokens.push( createToken(Token.IDENTIFIER, value, i) );
            }

            // if number literal
            else if (matchDecimalDigit(source[i])) {
                let numStr = source[i]; i++;
                
                while (matchDecimalDigit(source[i])) {
                    numStr += source[i]; i++;
                }

                if (source[i] === ".") {
                    numStr += source[i]; i++;
                    while (matchDecimalDigit(source[i])) {
                        numStr += source[i]; i++;
                    }        
                }
                
                if (source[i] === 'e' || source[i] === 'E') {
                    numStr += 'E'; i++;
                    if (source[i] === '+' || source[i] === '-') { // exponent sign
                        numStr += source[i]; i++;
                    }
                    if (!matchDecimalDigit(source[i])) {
                        throw createSyntaxError(`Expected exponent value`, i);                    
                    }
                    numStr += source[i]; i++;
                    while (matchDecimalDigit(source[i])) {
                        numStr += source[i]; i++;
                    }        
                }
                
                if (matchIdentifierStart(source[i])) {
                    throw createSyntaxError(`Invalid number`, i-1);
                } else if (source[i] === ".") {
                    throw createSyntaxError('Unexpected period', i);
                }

                tokens.push( createToken(Token.NUMBER, Number(numStr), i) );
            }
            
            else if (matchCommentStart(source[i])) {
                i++; while (source[i] !== "\n" && i < len) i++;
            }
            
            else if (matchSymbol( source[i]+source[i+1] )) {
                tokens.push( createToken(Token.SYMBOL, source[i]+source[i+1], i)); i+=2;
            } 
            
            else if (matchSymbol( source[i] )) {
                tokens.push( createToken(Token.SYMBOL, source[i], i)); i++;
            } 

            else {
                throw createSyntaxError(`Unexpected character '${source[i]}'`, i);
            }
        }
        
        return tokens;
    }
    
    return tokenize;
}


const Position = createLexer.Position = class {

    constructor (source, index) {
        this.source = source;
        this.index = index;
    }
    
    getLocation () {
        const lines = this.source.slice(0, this.index).split('\n');
        const row = lines.length;
        const col = lines.pop().length;
        return [row, col];
    }
    
    toString () {
        const [row, col] = this.getLocation();
        return `@${row}:${col}`;
    }    
}


const SyntaxError = createLexer.SyntaxError = class extends Error {
    
    constructor (message, source, index) {
        const position = new Position(source, index);
        super(`${message} ${position}`);
        this.position = position;
    }
}

module.exports = createLexer;
