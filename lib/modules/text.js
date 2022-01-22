/**
 *  text module
 *  ----------------------------------------------------------------------------
 *  
 *  This module contains functions that operate on the swan Text data type.
 */
 
module.exports = types => {
    const text = {};
    
    const undefined_text = new types.Undefined("Text");

    const isNumber = x => types.wrap(x) instanceof types.Numb;
    const isString = x => types.wrap(x) instanceof types.Text;

    
    /**
     *  ### text.find: Text s -> Text S -> Numb k
     *  Takes a string `s` as argument and returns a function `f`. 
     *  If the argument is a tuple, it applies only to its first item.
     *  
     *  The returned function `f`: 
     *  - takes a string `S` as argument and returns the first position of `s` 
     *    in `S` or `-1` if `s` is not contained in `S`.
     *  - returns Undefined Number if the argument of `f` is not a Text item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    text.find = s1 => s2 => isString(s1) && isString(s2) ? s2.indexOf(s1) : NaN;


    /**
     *  ### text.rfind: Text s -> Text S -> Numb k
     *  Takes a string `s` as argument and returns a function `f`.
     *  If the argument is a tuple, it applies only to its first item.
     *  
     *  The returned function `f`: 
     *  - takes a string `S` as argument and returns the last position of `s` 
     *    in `S` or `-1` if `s` is not contained in `S`.
     *  - returns Undefined Number if the argument of `f` is not a Text item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    text.rfind = s1 => s2 => isString(s1) && isString(s2) ? s2.lastIndexOf(s1) : NaN;
    

    /**
     *  ### text.lower: Text S -> Text s
     *  Returns the passed string in lower-case. 
     *  If the argument is not a Text item, this functions return Undefined text.
     *  If the parameter is a tuple, this function applies to its first item only.
     */
    text.lower = str => isString(str) ? str.toLowerCase() : undefined_text;
    

    /**
     *  ### text.upper: Text s -> Text S
     *  Returns the passed string in upper-case. 
     *  If the argument is not a Text item, this functions return Undefined text.
     *  If the parameter is a tuple, this function applies to its first item only.
     */
    text.upper = str => isString(str) ? str.toUpperCase() : undefined_text;
    
    
    /**
     *  ### text.trim: Text S -> Text s
     *  Removed the leading and trailing spaces from the given string.
     *  If the argument is not a Text item, this functions return Undefined text.
     *  If the parameter is a tuple, this function applies to its first item only.
     */
    text.trim = s => isString(s) ? s.trim() : undefined_text;


    /**
     *  ### text.trim_head: Text S -> Text s
     *  Removed the leading spaces from the given string.
     *  If the argument is not a Text item, this functions return Undefined text.
     *  If the parameter is a tuple, this function applies to its first item only.
     */
    text.trim_head = s => isString(s) ? s.trimStart() : undefined_text;


    /**
     *  ### text.trim_tail: Text S -> Text s
     *  Removed the trailing spaces from the given string.
     *  If the argument is not a Text item, this functions return Undefined text.
     *  If the parameter is a tuple, this function applies to its first item only.
     */
    text.trim_tail = s => isString(s) ? s.trimEnd() : undefined_text;
    

    /**
     *  ### text.head: Numb n -> Text S -> Text s
     *  Takes a number `n` as argument and returns a function `f`.
     *  If the argument is a tuple, it applies only to its first item.
     *  
     *  The returned function `f`: 
     *  - takes a string `s` as argument and returns the substring at the 
     *    left-side of the n-th character. If n is negative, the character 
     *    position is computed as relative to the end of `L`.
     *  - returns Undefined Text if the argument of `f` is not a Text item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    text.head = n => s => isNumber(n) && isString(s) ? s.slice(0,n) : undefined_text;
    

    /**
     *  ### text.tail: Numb n -> Text S -> Text s
     *  Takes a number `n` as argument and returns a function `f`.
     *  If the argument is a tuple, it applies only to its first item.
     *  
     *  The returned function `f`: 
     *  - takes a string `s` as argument and returns the substring at the 
     *    right-side of the n-th character (including the latter). If n is 
     *    negative, the character position is computed as relative to the 
     *    end of `S`.
     *  - returns Undefined Text if the argument of `f` is not a Text item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    text.tail = n => s => isNumber(n) && isString(s) ? s.slice(n) : undefined_text;


    /**
     *  ### text.split: Text s -> Text S -> List l
     *  Takes a string `s` as argument and returns a function `f`.
     *  If the argument is a tuple, it applies only to its first item.
     *  
     *  The returned function `f`: 
     *  - takes a string `S` as argument and returns the list of substring 
     *    separated by s. For example, if the divider is `s=":"` and the string 
     *    is `S="a:b:c"`, the function `f` returns `["a","b","c"]`.
     *  - returns Undefined Text if the argument of `f` is not a Text item
     *  - applies only on the first item if the parameter of `f` is a tuple
     */
    text.split = s1 => s2 => isString(s1) && isString(s2) ? s2.split(s1) : undefined_text; 
    
    
    return text;   
}
