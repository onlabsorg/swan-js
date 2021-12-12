
const Numb = module.exports = {
    
    // Math operations
    
    abs: Math.abs,      // Returns the absolute value of a number.
    max: Math.max,      // Returns the largest of zero or more numbers.
    min: Math.min,      // Returns the smallest of zero or more numbers.
    sqrt: Math.sqrt,    // Returns the positive square root of a number.

    PI: Math.PI,        // Ratio of the a circle's circumference to its diameter, approximately 3.14159.
    cos: Math.cos,      // Returns the cosine of a number.
    sin: Math.sin,      // Returns the sine of a number.
    tan: Math.tan,      // Returns the tangent of a number.
    acos: Math.acos,    // Returns the arccosine of a number.
    asin: Math.asin,    // Returns the arcsine of a number.
    atan: Math.atan,    // Returns the arctangent of a number.
    
    E: Math.E,          // Euler's constant and the base of natural logarithms, approximately 2.718.
    exp: Math.exp,      // Returns E^x, where x is the argument, and E is Euler's constant
    log: Math.log,      // Returns the natural logarithm of a number.
    log10: Math.log10,  // Returns the base 10 logarithm of a number.
    
    tanh: Math.tanh,    // Returns the hyperbolic tangent of a number.
    cosh: Math.cosh,    // Returns the hyperbolic cosine of a number.
    sinh: Math.sinh,    // Returns the hyperbolic sine of a number.
    acosh: Math.acosh,  // Returns the hyperbolic arccosine of a number.
    asinh: Math.asinh,  // Returns the hyperbolic arcsine of a number.
    atanh: Math.atanh,  // Returns the hyperbolic arctangent of a number.
    
    ceil: Math.ceil,    // Returns the smallest integer greater than or equal to a number.
    floor: Math.floor,  // Returns the largest integer less than or equal to a number.
    trunc: Math.trunc,  // Returns the integer part of the number x, removing any fractional digits.
    round: Math.round,  // Returns the value of a number rounded to the nearest integer.
    
    random: x => Math.random()*x,   // Returns a pseudo-random number between 0 and x.

    hex: s => Number(`0x${s}`), // Returns a number given its hexadecimal string representation.
    oct: s => Number(`0o${s}`), // Returns a number given its octal string representation.
    bin: s => Number(`0b${s}`), // Returns a number given its binary string representation.    
}
