/**
 *  bool module
 *  ----------------------------------------------------------------------------
 *  
 *  This module contains functions and constants that operate on the swan Bool
 *  data type.
 */

module.exports = types => {
    const bool = {};
    
    /**
     *  ### bool.TRUE constant
     *  This constant represent the boolean true value in swan.
     */
    bool.TRUE = true;
    
    
    /**
     *  ### bool.FALSE constant
     *  This constant represent the boolean false value in swan.
     */
    bool.FALSE = false;

    
    /**
     *  ### bool.from function
     *  
     *  Given a swan term X, the `bool.from` function returns TRUE if the
     *  term is truty, otherwise it returns FALSE.
     *  
     *  Falsy elements are: `FALSE`, `0`, `""`, `[]`, `{}`, `()`, an any 
     *  Undefined item and any tuple containing only falsy elements.
     *  
     *  Any other term is truty.
     */
    bool.from = (...values) => new types.Tuple(...values).toBoolean();

    
    /**
     *  ### bool.from function
     *  
     *  Given a swan term X, the `bool.not` function returns FALSE if the
     *  term is truty, otherwise it returns TRUE.
     *  
     *  For the definition of truty and falsy terms, see `bool.from`.
     */
    bool.not = (...values) => !bool.from(...values);
    
    return bool;  
}

