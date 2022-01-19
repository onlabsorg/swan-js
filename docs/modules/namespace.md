namespace module
----------------------------------------------------------------------------

This module contains functions that operate on the swan Namespace data type.
  
### namespace.size: Namespace N -> Numb n
Returns the number of items contained in the passed namespace.
If the argument is not a Namespace item, this function returns 
Undefined Number.
If the parameter is a tuple, this function applies only to the first
item and ignores the others.
  
### namespace.domain: Namespace N -> Text Tuple d
Returns the tuple of the names of the given namespace.
If the argument is not a Namespace item, this function returns 
Undefined Tuple.
If the parameter is a tuple, this function applies only to the first
item and ignores the others.
  
### namespace.map: Func F -> Namespace N -> Namespace FN
Takes a Func item `F` as argument and returns a function `f`. 
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a Namespace `N` as argument and returns a new namespace containg 
  the same names as N, but with associated values equal to F(N(name)).
- returns Undefined Namespace if the argument of `f` is not a Namespace 
  item
- applies only on the first item if the parameter of `f` is a tuple
  

