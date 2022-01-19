bool module
----------------------------------------------------------------------------

This module contains functions and constants that operate on the swan Bool
data type.
  
### bool.TRUE constant
This constant represent the boolean true value in swan.
  
### bool.FALSE constant
This constant represent the boolean false value in swan.
  
### bool.from function

Given a swan term X, the `bool.from` function returns TRUE if the
term is truty, otherwise it returns FALSE.

Falsy elements are: `FALSE`, `0`, `""`, `[]`, `{}`, `()`, an any 
Undefined item and any tuple containing only falsy elements.

Any other term is truty.
  
### bool.from function

Given a swan term X, the `bool.not` function returns FALSE if the
term is truty, otherwise it returns TRUE.

For the definition of truty and falsy terms, see `bool.from`.
  

