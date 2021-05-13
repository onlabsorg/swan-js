
class Lexer {
    
    constructor (options) {
        this.binaryOperators = new Set(options.binaryOperators);
        this.SYMBOLS = new Set( ['{', '[', '(', ')', ']', '}'].concat(options.binaryOperators.filter(operator => !this.matchIdentifierStart(operator))) );
    }

    matchSpace           (char) { return char && char.match(/^\s$/)           }
    matchQuote           (char) { return char && char.match(/^["'`]$/)        }
    matchIdentifierStart (char) { return char && char.match(/^[a-z_A-Z]$/)    }
    matchIdentifierPart  (char) { return char && char.match(/^[a-z_A-Z0-9]$/) }
    matchDecimalDigit    (char) { return char && char.match(/^[0-9]$/)        }
    matchSign            (char) { return char === "+" || char === "-"         }
    matchCommentStart    (sym)  { return sym === "#"                          }
    matchSymbol          (sym)  { return this.SYMBOLS.has(sym)                }
    
    * tokenize (source) {
        const createToken = (type, value, index) => 
                new this.constructor.Token(this, type, value, new this.constructor.Position(source, index));
        const createSyntaxError = (message, index) => 
                new this.constructor.SyntaxError(message, source, index);
        
        var i = 0, len = source.length;
        while (true) {
            while (this.matchSpace(source[i])) i++;
            if (i >= len) break;

            // if string literal
            if (this.matchQuote(source[i])) {
                let value = "";            
                let quoteSymbol = source[i]; i++;
                while (source[i] !== quoteSymbol) {
                    if (i >= len) throw createSyntaxError("Closing quote expected", i);
                    value += source[i]; i++;
                }
                let token = createToken(Token.STRING, value, i);
                token.quoteSymbol = quoteSymbol;
                yield token; i++;
            }
            
            // if identifier
            else if (this.matchIdentifierStart(source[i])) {
                let value = source[i]; i++;
                while (this.matchIdentifierPart(source[i])) {
                    value += source[i]; i++;
                }
                yield createToken(Token.IDENTIFIER, value, i);
            }

            // if number literal
            else if (this.matchDecimalDigit(source[i])) {
                let numStr = source[i]; i++;
                
                while (this.matchDecimalDigit(source[i])) {
                    numStr += source[i]; i++;
                }

                if (source[i] === ".") {
                    numStr += source[i]; i++;
                    while (this.matchDecimalDigit(source[i])) {
                        numStr += source[i]; i++;
                    }        
                }
                
                if (source[i] === 'e' || source[i] === 'E') {
                    numStr += 'E'; i++;
                    if (source[i] === '+' || source[i] === '-') { // exponent sign
                        numStr += source[i]; i++;
                    }
                    if (!this.matchDecimalDigit(source[i])) {
                        throw createSyntaxError(`Expected exponent value`, i);                    
                    }
                    numStr += source[i]; i++;
                    while (this.matchDecimalDigit(source[i])) {
                        numStr += source[i]; i++;
                    }        
                }
                
                if (this.matchIdentifierStart(source[i])) {
                    throw createSyntaxError(`Invalid number`, i-1);
                } else if (source[i] === ".") {
                    throw createSyntaxError('Unexpected period', i);
                }

                yield createToken(Token.NUMBER, Number(numStr), i);
            }
            
            else if (this.matchCommentStart(source[i])) {
                i++; while (source[i] !== "\n" && i < len) i++;
            }
            
            else if (this.matchSymbol( source[i]+source[i+1] )) {
                yield createToken(Token.SYMBOL, source[i]+source[i+1], i); i+=2;
            } 
            
            else if (this.matchSymbol( source[i] )) {
                yield createToken(Token.SYMBOL, source[i], i); i++;
            } 

            else {
                throw createSyntaxError(`Unexpected character '${source[i]}'`, i);
            }
        }
    }
    
    static get Position    () { return Position    }
    static get SyntaxError () { return SyntaxError }
    static get Token       () { return Token       }
}



class Token {
    
    constructor (lexer, type, value, pos) {
        this.lexer = lexer;
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
        return this.type === Token.IDENTIFIER && !this.lexer.binaryOperators.has(this.value);
    }
    
    matchBinaryOperator () {
        return (this.type === Token.SYMBOL || this.type === Token.IDENTIFIER) && 
                this.lexer.binaryOperators.has(this.value);
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



class Position {

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



class SyntaxError extends Error {
    
    constructor (message, source, index) {
        const position = new Position(source, index);
        super(`${message} ${position}`);
        this.position = position;
    }
}



module.exports = Lexer;
