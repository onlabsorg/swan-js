/**
 *  numb module
 *  ============================================================================
 *  
 *  This module contains functions and constants that operate on the swan Numb
 *  data type.
 *  
 *  Unless specified otherwise, all the functions of this library assume that
 *  their parameter is an item (1-d tuple). If more that one item is passed
 *  to a function, only the first item will be used and the others will be
 *  ignored.
 */

module.exports = types => {
    const numb = {};
    
    const isNumb = x => types.wrap(x) instanceof types.Numb;
    const isText = x => types.wrap(x) instanceof types.Text;


    /**
     *  Math constants
     *  ------------------------------------------------------------------------
     *  The following constants are defined:
     *  
     *  - `numb.INFINITY`: Infinity.
     *  - `numb.PI`: Ratio of the a circle's circumference to its diameter, approximately 3.14159.
     *  - `numb.E`: Euler's constant and the base of natural logarithms, approximately 2.718.
     */
    numb.INFINITY = Infinity;
    numb.PI = Math.PI;
    numb.E = Math.E;


    /**
     *  numb.parse: Text s -> Numb n
     *  ------------------------------------------------------------------------
     *  Converts a string to a number. It accepts also binary (0b...), octal
     *  (0o...) and exadecimal (0x...) string representations of numbers.
     *  If the argument is not a valid string, this function returns Undefined Number.
     */
    numb.parse = s => isText(s) ? Number(s) : NaN;
    
    
    /**
     *  Trigonometric functions
     *  ------------------------------------------------------------------------
     *  The Numb namespace contains the following trigonometric functions: 
     *  
     *  - `numb.cos`:  Returns the cosine of a number.
     *  - `numb.sin`:  Returns the sine of a number.
     *  - `numb.tan`:  Returns the tangent of a number.
     *  - `numb.acos`: Returns the arccosine of a number.
     *  - `numb.asin`: Returns the arcsine of a number.
     *  - `numb.atan`: Returns the arctangent of a number.
     *  
     *  If the argument is not a number, these functions return Undefined Number.
     */
    numb.cos  = x => isNumb(x) ? Math.cos(x)  : NaN;
    numb.sin  = x => isNumb(x) ? Math.sin(x)  : NaN;
    numb.tan  = x => isNumb(x) ? Math.tan(x)  : NaN;
    numb.acos = x => isNumb(x) ? Math.acos(x) : NaN;
    numb.asin = x => isNumb(x) ? Math.asin(x) : NaN;
    numb.atan = x => isNumb(x) ? Math.atan(x) : NaN;

    
    /**
     *  Hyperbolic functions
     *  ------------------------------------------------------------------------
     *  The Numb namespace contains the following hyperbolic functions: 
     *  
     *  - `numb.cosh`:  Returns the hyperbolic cosine of a number.
     *  - `numb.sinh`:  Returns the hyperbolic sine of a number.
     *  - `numb.tanh`:  Returns the hyperbolic tangent of a number.
     *  - `numb.acosh`: Returns the hyperbolic arccosine of a number.
     *  - `numb.asinh`: Returns the hyperbolic arcsine of a number.
     *  - `numb.atanh`: Returns the hyperbolic arctangent of a number.
     *  
     *  If the argument is not a number, these functions return Undefined Number.
     */
    numb.cosh  = x => isNumb(x) ? Math.cosh(x)  : NaN;
    numb.sinh  = x => isNumb(x) ? Math.sinh(x)  : NaN;
    numb.tanh  = x => isNumb(x) ? Math.tanh(x)  : NaN;
    numb.acosh = x => isNumb(x) ? Math.acosh(x) : NaN;
    numb.asinh = x => isNumb(x) ? Math.asinh(x) : NaN;
    numb.atanh = x => isNumb(x) ? Math.atanh(x) : NaN;
    
    
    /**
     *  Rounding
     *  ------------------------------------------------------------------------
     *  The following functions perform number rounding. 
     *  
     *  - `Math.ceil`: Returns the smallest integer greater than or equal to a number.
     *  - `Math.floor`: Returns the largest integer less than or equal to a number.
     *  - `Math.trunc`: Returns the integer part of the number x, removing any fractional digits.
     *  - `Math.round`: Returns the value of a number rounded to the nearest integer.
     *  
     *  If the argument is not a number, these functions return Undefined Number.
     */
    numb.ceil  = x => isNumb(x) ? Math.ceil(x)  : NaN;
    numb.floor = x => isNumb(x) ? Math.floor(x) : NaN;
    numb.trunc = x => isNumb(x) ? Math.trunc(x) : NaN;
    numb.round = x => isNumb(x) ? Math.round(x) : NaN;
    

    /**
     *  numb.abs - function
     *  ------------------------------------------------------------------------
     *  Returns the absolute value of a number. 
     *  If the argument is not a number, this functions return Undefined Number.
     */
    numb.abs = x => isNumb(x) ? Math.abs(x) : NaN;


    /**
     *  numb.exp - function
     *  ------------------------------------------------------------------------
     *  Returns E^x, where x is the argument, and E is Euler's constant. 
     *  If the argument is not a number, this functions return Undefined Number.
     */
    numb.exp = x => isNumb(x) ? Math.exp(x) : NaN;
    
    
    /**
     *  numb.log - function
     *  ------------------------------------------------------------------------
     *  Returns the natural logarithm of a number. 
     *  If the argument is not a number, this functions return Undefined Number.
     */
    numb.log = x => isNumb(x) ? Math.log(x) : NaN;
    
    
    /**
     *  numb.log10 - function
     *  ------------------------------------------------------------------------
     *  Returns the base 10 logarithm of a number. 
     *  If the argument is not a number, this functions return Undefined Number.
     */
    numb.log10 = x => isNumb(x) ? Math.log10(x) : NaN;
    
    
    /**
     *  numb.max - function
     *  ------------------------------------------------------------------------
     *  Returns the largest of zero or more numbers.
     *  If any argument is not a number, this functions return Undefined Number.
     */
    numb.max = Math.max;


    /**
     *  numb.min - function
     *  ------------------------------------------------------------------------
     *  Returns the smallest of zero or more numbers.
     *  If any argument is not a number, this functions return Undefined Number.
     */
    numb.min = Math.min;
    

    /**
     *  numb.random - function
     *  ------------------------------------------------------------------------
     *  Returns a pseudo-random number between 0 and the given argument.
     *  If the argument is not a number, this functions return Undefined Number.
     */
    numb.random = x => isNumb(x) ? Math.random()*x : NaN;


    /**
     *  numb.sqrt - function
     *  ------------------------------------------------------------------------
     *  Returns the positive square root of a number.
     *  If any argument is not a number, this functions return Undefined Number.
     */
    numb.sqrt = x => isNumb(x) ? Math.sqrt(x) : NaN;
    
    
    return numb;  
}

