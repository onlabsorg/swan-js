/**
 *  math module
 *  ============================================================================
 *  
 *  This module contains mathematical functions and constants.
 *  
 *  Unless specified otherwise, all the functions of this library assume that
 *  their parameter is an item (1-d tuple). If more that one item is passed
 *  to a function, only the first item will be used and the others will be
 *  ignored.
 */

module.exports = types => {
    const math = {};
    
    const isNumb = x => types.wrap(x) instanceof types.Numb;
    const isText = x => types.wrap(x) instanceof types.Text;


    /**
     *  Math constants
     *  ------------------------------------------------------------------------
     *  The following constants are defined:
     *  
     *  - `math.INFINITY`: Infinity.
     *  - `math.PI`: Ratio of the a circle's circumference to its diameter, approximately 3.14159.
     *  - `math.E`: Euler's constant and the base of natural logarithms, approximately 2.718.
     */
    math.INFINITY = Infinity;
    math.PI = Math.PI;
    math.E = Math.E;


    /**
     *  Trigonometric functions
     *  ------------------------------------------------------------------------
     *  The Numb namespace contains the following trigonometric functions: 
     *  
     *  - `math.cos`:  Returns the cosine of a number.
     *  - `math.sin`:  Returns the sine of a number.
     *  - `math.tan`:  Returns the tangent of a number.
     *  - `math.acos`: Returns the arccosine of a number.
     *  - `math.asin`: Returns the arcsine of a number.
     *  - `math.atan`: Returns the arctangent of a number.
     *  
     *  If the argument is not a number, these functions return `Undefined('Number')`.
     */
    math.cos  = x => isNumb(x) ? Math.cos(x)  : NaN;
    math.sin  = x => isNumb(x) ? Math.sin(x)  : NaN;
    math.tan  = x => isNumb(x) ? Math.tan(x)  : NaN;
    math.acos = x => isNumb(x) ? Math.acos(x) : NaN;
    math.asin = x => isNumb(x) ? Math.asin(x) : NaN;
    math.atan = x => isNumb(x) ? Math.atan(x) : NaN;

    
    /**
     *  Hyperbolic functions
     *  ------------------------------------------------------------------------
     *  The Numb namespace contains the following hyperbolic functions: 
     *  
     *  - `math.cosh`:  Returns the hyperbolic cosine of a number.
     *  - `math.sinh`:  Returns the hyperbolic sine of a number.
     *  - `math.tanh`:  Returns the hyperbolic tangent of a number.
     *  - `math.acosh`: Returns the hyperbolic arccosine of a number.
     *  - `math.asinh`: Returns the hyperbolic arcsine of a number.
     *  - `math.atanh`: Returns the hyperbolic arctangent of a number.
     *  
     *  If the argument is not a number, these functions return `Undefined('Number')`.
     */
    math.cosh  = x => isNumb(x) ? Math.cosh(x)  : NaN;
    math.sinh  = x => isNumb(x) ? Math.sinh(x)  : NaN;
    math.tanh  = x => isNumb(x) ? Math.tanh(x)  : NaN;
    math.acosh = x => isNumb(x) ? Math.acosh(x) : NaN;
    math.asinh = x => isNumb(x) ? Math.asinh(x) : NaN;
    math.atanh = x => isNumb(x) ? Math.atanh(x) : NaN;
    
    
    /**
     *  Rounding
     *  ------------------------------------------------------------------------
     *  The following functions perform number rounding. 
     *  
     *  - `math.ceil`: Returns the smallest integer greater than or equal to a number.
     *  - `math.floor`: Returns the largest integer less than or equal to a number.
     *  - `math.trunc`: Returns the integer part of the number x, removing any fractional digits.
     *  - `math.round`: Returns the value of a number rounded to the nearest integer.
     *  
     *  If the argument is not a number, these functions return `Undefined('Number')`.
     */
    math.ceil  = x => isNumb(x) ? Math.ceil(x)  : NaN;
    math.floor = x => isNumb(x) ? Math.floor(x) : NaN;
    math.trunc = x => isNumb(x) ? Math.trunc(x) : NaN;
    math.round = x => isNumb(x) ? Math.round(x) : NaN;
    

    /**
     *  math.abs - function
     *  ------------------------------------------------------------------------
     *  Returns the absolute value of a number. 
     *  If the argument is not a number, this functions return `Undefined('Number')`.
     */
    math.abs = x => isNumb(x) ? Math.abs(x) : NaN;


    /**
     *  math.exp - function
     *  ------------------------------------------------------------------------
     *  Returns E^x, where x is the argument, and E is Euler's constant. 
     *  If the argument is not a number, this functions return `Undefined('Number')`.
     */
    math.exp = x => isNumb(x) ? Math.exp(x) : NaN;
    
    
    /**
     *  math.log - function
     *  ------------------------------------------------------------------------
     *  Returns the natural logarithm of a number. 
     *  If the argument is not a number, this functions return `Undefined('Number')`.
     */
    math.log = x => isNumb(x) ? Math.log(x) : NaN;
    
    
    /**
     *  math.log10 - function
     *  ------------------------------------------------------------------------
     *  Returns the base 10 logarithm of a number. 
     *  If the argument is not a number, this functions return `Undefined('Number')`.
     */
    math.log10 = x => isNumb(x) ? Math.log10(x) : NaN;
    
    
    /**
     *  math.max - function
     *  ------------------------------------------------------------------------
     *  Returns the largest of zero or more numbers.
     *  If any argument is not a number, this functions return `Undefined('Number')`.
     */
    math.max = Math.max;


    /**
     *  math.min - function
     *  ------------------------------------------------------------------------
     *  Returns the smallest of zero or more numbers.
     *  If any argument is not a number, this functions return `Undefined('Number')`.
     */
    math.min = Math.min;
    

    /**
     *  math.random - function
     *  ------------------------------------------------------------------------
     *  Returns a pseudo-random number between 0 and the given argument.
     *  If the argument is not a number, this functions return `Undefined('Number')`.
     */
    math.random = x => isNumb(x) ? Math.random()*x : NaN;


    /**
     *  math.sqrt - function
     *  ------------------------------------------------------------------------
     *  Returns the positive square root of a number.
     *  If any argument is not a number, this functions return `Undefined('Number')`.
     */
    math.sqrt = x => isNumb(x) ? Math.sqrt(x) : NaN;
    
    
    return math;  
}
