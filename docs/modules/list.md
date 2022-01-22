list module
----------------------------------------------------------------------------

This module contains functions that operate on the swan List data type.
  
### list.reverse: List l1 -> List l2
Given a list l1, returns a new list l2, containing the items of l1 in
reversed order.
If the argument is not a List item, this function returns Undefined List.
If the parameter is a tuple, this function applies only to the first
item and ignore the others.
  
### list.find: Item x -> List L -> Numb k
Takes an item `x` as argument and returns a function `f`. If the 
argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a list `L` as argument and returns the first position of `x` in 
  `L` or `-1` if `x` is not contained in `L`.
- returns Undefined List if the argument of `f` is not a List item
- applies only on the first item if the parameter of `f` is a tuple
  
### list.rfind: Item x -> List L -> Numb k
Takes an item `x` as argument and returns a function `f`. 
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a list `L` as argument and returns the last position of `x` in 
  `L` or `-1` if `x` is not contained in `L`.
- returns Undefined List if the argument of `f` is not a List item
- applies only on the first item if the parameter of `f` is a tuple
  
### list.head: Numb n -> List L -> List l
Takes a number `n` as argument and returns a function `f`. 
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a list `L` as argument and returns the sub-list at the left-side 
  of the n-th item. If n is negative, the item position is computed as 
  relative to the end of `L`.     
- returns Undefined List if the argument of `f` is not a List item
- applies only on the first item if the parameter of `f` is a tuple
  
### list.tail: Numb n -> List L -> List l
Takes a number `n` as argument and returns a function `f`. 
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a list `L` as argument and returns the sub-list at the 
  right-side of the n-th item (including the latter). If n is negative, 
  the item position is computed as relative to the end of `L`.     
- returns Undefined List if the argument of `f` is not a List item
- applies only on the first item if the parameter of `f` is a tuple
  
### list.join: Text s -> List L -> Text S
Takes a separator `s` as argument and returns a function `f`.
If the argument is a tuple, it applies only to its first item.

The returned function `f`: 
- takes a List `L` of Text items as argument and returns the string
  obtained by joining all the items with interposed  sparator.
- returns Undefined List if the argument of `f` is not a List item
- applies only on the first item if the parameter of `f` is a tuple
  

