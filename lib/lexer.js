
class SyntaxError extends Error {
    
    constructor (source, pos, message) {
        super(`${message} at pos ${pos}`);
    }
}






const matchSpace = char => char && char.match(/^\s$/);
const matchQuote = char => char && char.match(/^["'`]$/);
const matchIdentifierStart = char => char && char.match(/^[a-z_A-Z]$/);
const matchIdentifierPart = char => char && char.match(/^[a-z_A-Z0-9]$/);
const matchDecimalDigit = char => char && char.match(/^[0-9]$/);
const matchSign = char => char === "+" || char === "-";

const SYMBOLS = new Set( ['{', '[', '(', ')', ']', '}', "=", ":", '->', ".", ","] );
const matchSymbol = sym => SYMBOLS.has(sym);

const matchCommentStart = sym => sym === "#";

const binaryOperators = new Set();


function createLexer (options) {
    const matchSpace = char => char && char.match(/^\s$/);
    const matchQuote = char => char && char.match(/^["'`]$/);
    const matchIdentifierStart = char => char && char.match(/^[a-z_A-Z]$/);
    const matchIdentifierPart = char => char && char.match(/^[a-z_A-Z0-9]$/);
    const matchDecimalDigit = char => char && char.match(/^[0-9]$/);
    const matchSign = char => char === "+" || char === "-";

    const binaryOperators = new Set(options.binaryOperators);
    
    const SYMBOLS = new Set( ['{', '[', '(', ')', ']', '}'].concat(options.binaryOperators.filter(operator => !matchIdentifierStart(operator))) );
    const matchSymbol = sym => SYMBOLS.has(sym);
    
    class Token {
        
        constructor (type, value) {
            this.type = type;
            this.value = value;
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
    Token.STRING0 = 2;
    Token.STRING1 = 3;
    Token.STRING2 = 4;
    Token.IDENTIFIER = 5;
    
    
    const tokenize = (source) => {
        const tokens = [];
        
        var i = 0, len = source.length;
        while (true) {
            while (matchSpace(source[i])) i++;
            if (i >= len) break;

            // if string literal
            if (matchQuote(source[i])) {
                let value = "";            
                let quoteSymbol = source[i]; i++;
                while (source[i] !== quoteSymbol) {
                    if (i >= len) throw new SyntaxError(source, i, "Closing quote expected");
                    value += source[i]; i++;
                }
                let token = new Token(Token.STRING, value);
                token.quoteSymbol = quoteSymbol;
                tokens.push(token); i++;
            }
            
            // if identifier
            else if (matchIdentifierStart(source[i])) {
                let value = source[i]; i++;
                while (matchIdentifierPart(source[i])) {
                    value += source[i]; i++;
                }
                tokens.push( new Token(Token.IDENTIFIER, value) );
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
                        throw new SyntaxError(source, i, `Expected exponent symbol`);                    
                    }
                    numStr += source[i]; i++;
                    while (matchDecimalDigit(source[i])) {
                        numStr += source[i]; i++;
                    }        
                }
                
                if (matchIdentifierStart(source[i])) {
                    throw new SyntaxError(source, i, `Name names cannot start with a number`);
                } else if (source[i] === ".") {
                    throw new SyntaxError(source, i, 'Unexpected period');
                }

                tokens.push( new Token(Token.NUMBER, Number(numStr)) );
            }
            
            else if (matchCommentStart(source[i])) {
                i++; while (source[i] !== "\n" && i < len) i++;
            }
            
            else if (matchSymbol( source[i]+source[i+1] )) {
                tokens.push( new Token(Token.SYMBOL, source[i]+source[i+1])); i+=2;
            } 
            
            else if (matchSymbol( source[i] )) {
                tokens.push( new Token(Token.SYMBOL, source[i])); i++;
            } 

            else {
                throw new Error(`Unexpected character '${source[i]}' at pos ${i}`);
            }
        }
        
        return tokens;
    }
    
    return tokenize;
}






module.exports = createLexer;
