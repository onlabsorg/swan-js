/**
 *  math - swan stdlib module
 *  ============================================================================
 *  This module contains mathematical functions.
 */



module.exports = {

    /**
     *  math.E - constant
     *  ------------------------------------------------------------------------
     *  Euler's constant and the base of natural logarithms, approximately 2.718.
     */
    E: Math.E,


    /**
     *  math.PI - constant
     *  ------------------------------------------------------------------------
     *  Ratio of the a circle's circumference to its diameter, approximately 3.14159.
     */
    PI: Math.PI,


    /**
     *  math.abs - function
     *  ------------------------------------------------------------------------
     *  Returns the absolute value of a number.
     */
    abs: Math.abs,


    /**
     *  math.acos - function
     *  ------------------------------------------------------------------------
     *  Returns the arccosine of a number.
     */
    acos: Math.acos,


    /**
     *  math.acosh - function
     *  ------------------------------------------------------------------------
     *  Returns the hyperbolic arccosine of a number.
     */
    acosh: Math.acosh,


    /**
     *  math.asin - function
     *  ------------------------------------------------------------------------
     *  Returns the arcsine of a number.
     */
    asin: Math.asin,


    /**
     *  math.asinh - function
     *  ------------------------------------------------------------------------
     *  Returns the hyperbolic arcsine of a number.
     */
    asinh: Math.asinh,


    /**
     *  math.atan - function
     *  ------------------------------------------------------------------------
     *  Returns the arctangent of a number.
     */
    atan: Math.atan,


    /**
     *  math.atanh - function
     *  ------------------------------------------------------------------------
     *  Returns the hyperbolic arctangent of a number.
     */
    atanh: Math.atanh,


    /**
     *  math.ceil - function
     *  ------------------------------------------------------------------------
     *  Returns the smallest integer greater than or equal to a number.
     */
    ceil: Math.ceil,


    /**
     *  math.cos - function
     *  ------------------------------------------------------------------------
     *  Returns the cosine of a number.
     */
    cos: Math.cos,


    /**
     *  math.cosh - function
     *  ------------------------------------------------------------------------
     *  Returns the hyperbolic cosine of a number.
     */
    cosh: Math.cosh,


    /**
     *  math.exp - function
     *  ------------------------------------------------------------------------
     *  Returns E^x, where x is the argument, and E is Euler's constant
     *  (2.718…, the base of the natural logarithm).
     */
    exp: Math.exp,


    /**
     *  math.floor - function
     *  ------------------------------------------------------------------------
     *  Returns the largest integer less than or equal to a number.
     */
    floor: Math.floor,


    /**
     *  math.log - function
     *  ------------------------------------------------------------------------
     *  Returns the natural logarithm (㏒e, also, ㏑) of a number.
     */
    log: Math.log,


    /**
     *  math.log10 - function
     *  ------------------------------------------------------------------------
     *  Returns the base 10 logarithm of a number.
     */
    log10: Math.log10,


    /**
     *  math.max - function
     *  ------------------------------------------------------------------------
     *  Returns the largest of zero or more numbers.
     */
    max: Math.max,


    /**
     *  math.min - function
     *  ------------------------------------------------------------------------
     *  Returns the smallest of zero or more numbers.
     */
    min: Math.min,


    /**
     *  math.random - function
     *  ------------------------------------------------------------------------
     *  Returns a pseudo-random number between 0 and 1.
     */
    random: x => Math.random()*x,


    /**
     *  math.round - function
     *  ------------------------------------------------------------------------
     *  Returns the value of a number rounded to the nearest integer.
     */
    round: Math.round,


    /**
     *  math.sin - function
     *  ------------------------------------------------------------------------
     *  Returns the sine of a number.
     */
    sin: Math.sin,


    /**
     *  math.sinh - function
     *  ------------------------------------------------------------------------
     *  Returns the hyperbolic sine of a number.
     */
    sinh: Math.sinh,


    /**
     *  math.sqrt - function
     *  ------------------------------------------------------------------------
     *  Returns the positive square root of a number.
     */
    sqrt: Math.sqrt,


    /**
     *  math.tan - function
     *  ------------------------------------------------------------------------
     *  Returns the tangent of a number.
     */
    tan: Math.tan,


    /**
     *  math.tanh - function
     *  ------------------------------------------------------------------------
     *  Returns the hyperbolic tangent of a number.
     */
    tanh: Math.tanh,


    /**
     *  math.trunc - function
     *  ------------------------------------------------------------------------
     *  Returns the integer part of the number x, removing any fractional digits.
     */
    trunc: Math.trunc,


    /**
     *  math.hex - function
     *  ------------------------------------------------------------------------
     *  Returns a number given its hexadecimal string representation.
     */
    hex: s => Number(`0x${s}`),


    /**
     *  math.oct - function
     *  ------------------------------------------------------------------------
     *  Returns a number given its octal string representation.
     */
    oct: s => Number(`0o${s}`),


    /**
     *  math.bin - function
     *  ------------------------------------------------------------------------
     *  Returns a number given its binary string representation.
     */
    bin: s => Number(`0b${s}`),
}
