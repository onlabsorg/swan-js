
module.exports = types => {
    const numb = {};
    
    const SyncMap = fn => (...values) => 
            new types.Tuple(...values.map(fn)).unwrap();
            
    const isNumber = x => types.wrap(x) instanceof types.Numb;
    const isString = x => types.wrap(x) instanceof types.Text;


    /**
     *  ### Math constants
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
     *  ### numb.parse: Text s -> Numb n
     *  Converts a string to a number. It accepts also binary (0b...), octal
     *  (0o...) and exadecimal (0x...) string representations of numbers.
     *  
     *  If the argument is not a valid string, this function returns Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    numb.parse = SyncMap(s => isString(s) ? Number(s) : NaN);
    
    
    /**
     *  ### Trigonometric functions
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
     *  If the parameter is a tuple, these functions apply to each item of the
     *  tuple and return a tuple.
     */
    numb.cos  = SyncMap(x => isNumber(x) ? Math.cos(x)  : NaN);  
    numb.sin  = SyncMap(x => isNumber(x) ? Math.sin(x)  : NaN);  
    numb.tan  = SyncMap(x => isNumber(x) ? Math.tan(x)  : NaN);  
    numb.acos = SyncMap(x => isNumber(x) ? Math.acos(x) : NaN);
    numb.asin = SyncMap(x => isNumber(x) ? Math.asin(x) : NaN);
    numb.atan = SyncMap(x => isNumber(x) ? Math.atan(x) : NaN);

    
    /**
     *  ### Hyperbolic functions
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
     *  If the parameter is a tuple, these functions apply to each item of the
     *  tuple and return a tuple.
     */
    numb.cosh  = SyncMap(x => isNumber(x) ? Math.cosh(x)  : NaN);
    numb.sinh  = SyncMap(x => isNumber(x) ? Math.sinh(x)  : NaN);
    numb.tanh  = SyncMap(x => isNumber(x) ? Math.tanh(x)  : NaN);
    numb.acosh = SyncMap(x => isNumber(x) ? Math.acosh(x) : NaN);
    numb.asinh = SyncMap(x => isNumber(x) ? Math.asinh(x) : NaN);
    numb.atanh = SyncMap(x => isNumber(x) ? Math.atanh(x) : NaN);
    
    
    /**
     *  ### Rounding
     *  The following functions perform number rounding. 
     *  
     *  - `Math.ceil`: Returns the smallest integer greater than or equal to a number.
     *  - `Math.floor`: Returns the largest integer less than or equal to a number.
     *  - `Math.trunc`: Returns the integer part of the number x, removing any fractional digits.
     *  - `Math.round`: Returns the value of a number rounded to the nearest integer.
     *  
     *  If the argument is not a number, these functions return Undefined Number.
     *  If the parameter is a tuple, these functions apply to each item of the
     *  tuple and return a tuple.
     */
    numb.ceil  = SyncMap(x => isNumber(x) ? Math.ceil(x)  : NaN);
    numb.floor = SyncMap(x => isNumber(x) ? Math.floor(x) : NaN);
    numb.trunc = SyncMap(x => isNumber(x) ? Math.trunc(x) : NaN);
    numb.round = SyncMap(x => isNumber(x) ? Math.round(x) : NaN);
    

    /**
     *  ### numb.abs - function
     *  Returns the absolute value of a number. 
     *  
     *  If the argument is not a number, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    numb.abs = SyncMap(x => isNumber(x) ? Math.abs(x) : NaN);


    /**
     *  ### numb.exp - function
     *  Returns E^x, where x is the argument, and E is Euler's constant. 
     *  
     *  If the argument is not a number, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    numb.exp = SyncMap(x => isNumber(x) ? Math.exp(x) : NaN);
    
    
    /**
     *  ### numb.log - function
     *  Returns the natural logarithm of a number. 
     *  
     *  If the argument is not a number, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    numb.log = SyncMap(x => isNumber(x) ? Math.log(x) : NaN);
    
    
    /**
     *  ### numb.log10 - function
     *  Returns the base 10 logarithm of a number. 
     *  
     *  If the argument is not a number, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    numb.log10 = SyncMap(x => isNumber(x) ? Math.log10(x) : NaN);
    
    
    /**
     *  ### numb.max - function
     *  Returns the largest of zero or more numbers.
     *  If any argument is not a number, this functions return Undefined Number.
     */
    numb.max = Math.max;


    /**
     *  ### numb.min - function
     *  Returns the smallest of zero or more numbers.
     *  If any argument is not a number, this functions return Undefined Number.
     */
    numb.min = Math.min;
    

    /**
     *  ### numb.random - function
     *  Returns a pseudo-random number between 0 and the given argument.
     *  
     *  If the argument is not a number, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    numb.random = SyncMap(x => isNumber(x) ? Math.random()*x : NaN);


    /**
     *  ### numb.sqrt - function
     *  Returns the positive square root of a number.
     *  
     *  If any argument is not a number, this functions return Undefined Number.
     *  If the parameter is a tuple, this function apply to each item of the
     *  tuple and returns a tuple.
     */
    numb.sqrt = SyncMap(x => isNumber(x) ? Math.sqrt(x) : NaN);
    
    return numb;  
}

